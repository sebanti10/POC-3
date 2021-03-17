const checkAge = dob => {
    const year = dob.split("-")[2];

    if (year > 2003) 
    {
        console.log("DOB year should be less than 1993");
    }  
}

checkAge("01-01-2009");