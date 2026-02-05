const FormData = require("../models/FormData");




async function CreateForm(payload) {
    try {
        const {user,category,visitorsName,visitorsEmail,visitorsPhone} = payload;
        if(!user){
            throw new Error("User required");
        }
        if(!category){
            throw new Error("Category is required");
        }
        if(!visitorsName){
            throw new Error("Visitors Name is required");
        }

        const form = await FormData.create({
            user : user,
            category : category,
            visitorsName: visitorsName,
            visitorsEmail : visitorsEmail,
            visitorsPhone : visitorsPhone,
        })

        if(!form){
            throw new Error("Something went wrong while Submiting Form")
        }

        return {
            form
        }


    } catch (error) {
        throw error;
    }
}



async function getAllForms(limit = 10, skip = 0) {
    try {
      const allForms = await FormData.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await FormData.countDocuments(); // For total count
      
      return {
        forms: allForms,
        pagination: {
          limit,
          skip,
          total,
          pages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: skip > 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
  

module.exports={
    CreateForm,
    getAllForms,
}
