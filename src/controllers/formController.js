const { CreateForm, getAllForms } = require("../services/formService")



async function createForm(req,res) {
    try {
        const {user,category,visitorsName,visitorsEmail,visitorsPhone} = req.body;
        console.log("requ",req.body);
        console.log("requ",req);
        if(!user){
            return res.status(400).json({message : "User is Required"});
        }
        if(!category){
            return res.status(400).json({message :"Category is Required"});
        }
        if(!visitorsName){
            return res.status(400).json({message : "Visitors Name is required"}) ;
        }


        const form = await CreateForm(req.body);
        return res.status(201).json(form);

    } catch (error) {
        return res.status(error.statusCode || 500)
    }
}


async function getAllForm(req,res) {
    try {
        const {limit,skip} = req.query;

        const formData = await getAllForms(limit,skip)

        return res.status(200).json(formData);
    } catch (error) {
        return res.status(error.statusCode || 500).json({message : error.message || 'Internal Server error'});
    }
}


module.exports={
    createForm,
    getAllForm,
}