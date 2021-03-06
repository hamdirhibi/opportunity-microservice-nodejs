const Notification = require ('../models/notification');
const Opportunity = require('../models/opportunity');
const User = require('../models/user') ; 
const Application = require('../models/application') ; 
const Skill = require('../models/skill');



exports.getOpportunities= async (req,res) =>{
    try {
        
        const ds = await Opportunity
        .find()
        .populate({path: 'skills', Model: Skill })
        .populate('company')
        .exec();
    
        res.json(ds)
    }
    catch(err){
        res.json({message: err})
    }
}
exports.getOpportunityById= async (req,res) =>{
    try {
        
        const ds = await Opportunity
        .findById(
            req.params.opportunityId 
        )
        .populate({path: 'skills', Model: Skill })
        .populate({ path :'company', 
                    populate : { path : 'opportunities', Model : Opportunity } 
                  })
        .populate('applications')
        .exec() ;
    
        res.json(ds)
    }
    catch(err){
        res.json({message: err})
    }
}


exports.newOpportunity = async (req,res) =>{

    try{
        console.log(req.userData)
        const company = await User.findById(req.userData.user._id); 
        console.log()
        if (!company) {
            return res
            .status(409)
            .json({ message: "company  doesn't  exist ! " });
        }
        const createdAt = new Date();
        
        if (createdAt>req.body.date){
            return res
            .status(409)
            .json({ message: "date must be upper than current date   ! " });
        }
       


        let skills = [];
        skills = req.body.skills; 
        let image = null ;
        if (req.files!=undefined)
            image = req.files[0].path;
        var newOpportunity ; 
        switch (req.body.type)  {
        case "INTERNSHIP":  {
            newOpportunity = await Opportunity.create({
            title : req.body.title ,
            description : req.body.description ,
            date : new Date()  ,
            cover : image ,
            type : req.body.type ,
            sallary : req.body.sallary ,
            company : req.userData.user._id,
            skills : skills , 
            createdAt : createdAt , 
            status : 'AVAILABEL' 
        });break }
        case "SESSION":{ 
            newOpportunity  = await Opportunity.create({
            title : req.body.title ,
            description : req.body.description ,
            date : new Date()  ,
            cover : image ,
            type : req.body.type ,
            price : req.body.price ,
            company : req.userData.user._id,
            skills : skills , 
            createdAt : createdAt , 
            status : 'AVAILABEL' 
        });break } 
        case "JOB":{ 
            newOpportunity  = await Opportunity.create({
            title : req.body.title ,
            description : req.body.description ,
            date : new Date()  ,
            cover : image ,
            type : req.body.type ,
            sallary : req.body.sallary ,
            company : req.userData.user._id,
            contratType : req.body.contratType,
            skills : skills , 
            createdAt : createdAt , 
            status : 'AVAILABEL' 
        });break ;} 
        } 
        await company.opportunities.push(newOpportunity) ; 
        
        await company.save().then( () =>{
            req.userData.user=company; 
            res.status(200).json(newOpportunity);
        }) 


    }catch (err){
        console.log(err)
        res.status(400).json({message : err}); 
        console.log(err) ;
    }


}


exports.getOpportunitiesByCompany = async (req,res) =>{
    try {
        
        const ds = await Opportunity.find({
            company : req.params.companyId,
        })     
        .populate({path: 'skills', Model: Skill })
        .populate('company')
        .exec() ; 

        res.json(ds)
    }
    catch(err){
        res.json({message: err})
    } 
}


exports.deleteOpportunity = async (req,res) =>{
    try {
        const opportunity = await User.findById(req.params.opportunityId); 
        
        if (!opportunity) {
            return res
            .status(409)
            .json({ message: "Opportunity  doesn't  exist ! " });
        }

        
        await Application.deleteMany({
            opportunity : req.params.opportunityId
        }) ; 

        await Opportunity.deleteOne({
            _id : req.params.opportunityId
        })

        res.status(200).json({message : 'Successfully deleting opportunity '}); 
    }
    catch(err){
        res.json({message: err})
    }
}



exports.updateOpportunity = async (req,res) =>{
    try {
        const opportunity = await User.findById(req.params.opportunityId); 
        
        if (!opportunity){
            return res
            .status(409)
            .json({ message: "Opportunity  doesn't  exist ! " });
        }
        const createdAt = new Date();

        if (createdAt>req.body.startAt){
            return res
            .status(409)
            .json({ message: "date start must be upper than actual date   ! " });
        }
        if (req.body.endAt<req.body.startAt){
            return res
            .status(409)
            .json({ message: "date start must be before date end   ! " });
        }


        let skills = [];
        skills = req.body.skills; 
        
        const opportunityUpdated =  await Opportunity.updateOne({
            
                _id : req.body.opportunityId,
                title : req.body.title ,
                description : req.body.description ,
                startAt : req.body.startAt ,
                endtAt : req.body.endtAt ,
                type : req.body.type ,
                sallary : req.body.sallary ,
                company : req.params.companyId,
                skills : skills , 
                user : req.params.userId , 
                status : req.body.status
            
        })
        res.status(200).json(opportunityUpdated); 
    }
    catch(err){
        res.json({message: err})
    }
}
exports.updateOpportunityCover = async (req,res) =>{
    try {
        
        await  Opportunity.updateOne(
            {_id : req.params.sessionId} ,
             {
                 $set : {
                     cover : req.body.cover
                 }
             }

        )
    }
    catch(err){
        res.json({message: err})
    }
}


exports.updateOpportunityDuration = async (req,res) =>{
    try {
        
        await Opportunity.updateOne(
            {_id : req.params.sessionId} ,
             {
                 $set : {
                     duration : req.body.duration
                 }
             }

        )
    }
    catch(err){
        res.json({message: err})
    }
}
exports.updateOpportunityDate= async (req,res) =>{
    try {
        
        await Opportunity.updateOne(
            {_id : req.params.sessionId} ,
             {
                 $set : {
                     date : req.body.date
                 }
             }
        )
    }
    catch(err){
        res.json({message: err})
    }
}
