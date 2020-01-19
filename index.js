var uuid=require("uuid");
module.exports = class smsauthIndex
{
	constructor(config,dist)
	{
		this.config=config.statics
		this.context=this.config.context 
        this.bootstrap=require('./bootstrap.js')
        this.enums=require('./struct.js') 
        this.tempConfig=require('./config.js')
		this.codeLength=5
		if(this.config.codeLength)this.codeLength=this.config.codeLength
        if(this.config.captchaContext)
           this.ccontext=this.config.captchaContext
		//global.acc=new accountManager(dist)
	}
	getExpTime(min)
	{
		return new Date((new Date()).getTime()+1000*60*min )
	}
	async login(msg,func,self)
    {
        var dt=msg.data;
        if(this.ccontext)
        {
            var a = await global.captcha.validate(dt.captcha)
            if(!a)
                return func({m:"smsauth001"})
            
        }
		var code = await global.db.SearchOne(self.context,'smsauth_code',{where:{phone:dt.phone}});
		if(code)
		{ 
			if(code.expireDate>new Date())
			{
				return func({m:"smsauth001"})
			}
			if(code.send>3)
			{
				if(!code.sendTime)code.sendTime=self.getExpTime(10);
				if(code.sendTime>new Date())
					return func({m:"smsauth003"});	
				code.send = 0
			}
		}
		else
		{
			code={}
			code._id = uuid.v4();
			code.submitDate = new Date();
			code.send=0;
			code.phone=dt.phone
		}
		code.expireDate =self.getExpTime(2);
		code.code = global.ori.RandomInt(self.codeLength) 
		code.send++;
		code.len = 0;
		var x = await global.notification.send('publicsms','loginsms',{code:code.code,to:dt.phone});
		await global.db.Save(self.context,'smsauth_code',['_id'],code);
		return func(null,{})
    }
	async verify(msg,func,self)
    {
        var dt=msg.data;
		var code = await global.db.SearchOne(self.context,'smsauth_code',{where:{phone:dt.phone}});
		if(!code)
		{
			return func({m:"smsauth002"})
		}
		if(code.code!=dt.code)
		{
			if(code.len>3)
			{
				return func({m:"smsauth004"});
			}
			code.len++;
			await global.db.Save(self.context,'smsauth_code',['_id'],code);
			return func({m:"smsauth005"});
		}		
        var acc = await global.acc.existAccount({$filter:"phones/number eq '"+dt.phone+"'"});
		var userid = uuid.v4();
		var roles=await global.db.SearchOne(self.context,'global_options',{where:{name:'smsauth_role'}});
		if(!roles)
			roles={role:0}
		if(acc.value.length)
		{
			userid=acc.value[0].id
			var r=acc.value[0].roles
			roles.role=r|roles.role; 
			await global.acc.update(userid,'roles',roles.role);
		}
		else
		{ 
			await global.acc.create(userid,roles.role);
			await global.acc.update(userid,'phones',[{number:dt.phone}]);
		}
		
		return func (null,{session:[
				{name:'userid',value:userid},
				{name:'type',value:'smsAuth'},
				{name:'roles',value:roles.role},
			] 
		  })
    }
	async sampleFunction(msg,func,self)
	{
		var dt=msg.data;
		var session=msg.session;
		if(!dt.user.userid)
			return func({m:"default001"})
		var data =await global.db.Search(self.context,'user',{},dt);
		return func(null,data);
	}
}