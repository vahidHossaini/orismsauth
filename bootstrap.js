module.exports = class smsauthBootstrap{
  constructor(config)
  {
    this.funcs=[
      {
          name:'login',
          title:'login with mobile number' ,
          inputs:[
			{
				name:'mobile',
				type:'string',
				nullable:false
			}
          ]
      }, 
      {
          name:'verify',
          title:'verify with mobile number' ,
          inputs:[
			{
				name:'code',
				type:'string',
				nullable:false
			}
          ]
      }, 
      {
          name:'sampleFunction',
          title:'this is sample' ,
          inputs:[
			{
				name:'user',
				type:'UserInterface',
				nullable:false
			}
          ]
      }, 
	  
	  
	   
    ]
    this.auth=[ 
            {
                name: 'login',
                role: 'login'
            },
        ]
  }
}