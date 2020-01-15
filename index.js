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
		//global.acc=new accountManager(dist)
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