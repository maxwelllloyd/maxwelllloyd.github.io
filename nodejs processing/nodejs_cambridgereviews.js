var fs = require("fs")

//Load Reviews
var reviews = JSON.parse(fs.readFileSync("reviewsTest.json","UTF-8"))

//Load Businesses
var business = JSON.parse(fs.readFileSync("businesses.json","UTF-8"))

//Create blank array of businesses
//Push all MIT and Harvard businesses to the businessData variable

var businessData = []

business.forEach(function(d) {
    if (d.schools[0] == "Massachusetts Institute of Technology")
        return businessData.push(d)
    if (d.schools[0] == "Harvard University")
        return businessData.push(d)
    if (d.schools[1] == "Massachusetts Institute of Technology")
        return businessData.push(d)
    if (d.schools[1] == "Harvard University")
        return businessData.push(d)
})


//Create an empty array for business IDs
//Push all the Harvard and MIT business IDs to this array

var businessID = []

businessData.forEach(function(d){
    businessID.push(d.business_id)
})


//Create an empty array for reviews
//Push all the Harvard and MIT business reviews to this array
var reviewsCambridge = []

reviews.forEach(function(d) {
	businessID.forEach(function(e) {
		if(e == d.business_id) {
			return reviewsCambridge.push(d)
		}
	})
})

fs.writeFileSync("reviewsCambridge.json", JSON.stringify(reviewsCambridge,null,4))