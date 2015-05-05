var fs = require("fs")

//Load Reviews
var reviews = JSON.parse(fs.readFileSync("reviewsCambridge.json","UTF-8"))

//Load Businesses
var business = JSON.parse(fs.readFileSync("businesses.json","UTF-8"))

//Load map
var map = JSON.parse(fs.readFileSync("BOUNDARY_CDDNeighborhoods.topojson","UTF-8"))

//Write to a formatted json file
/*fs.writeFileSync("formattedMap.json", JSON.stringify(map,null,4))*/

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

//Write to a formatted JSON file
/*fs.writeFileSync("formattedBusinesses.json", JSON.stringify(businessData,null,4))*/

//Create an empty array for business IDs
//Push all the Harvard and MIT business IDs to this array
var businessID = []

businessData.forEach(function(d){
    businessID.push(d.business_id)
})



//Push all of the review information except the review into a new array
var minimalReview = []

reviews.forEach(function(d) {
    if(new Date(d.date) > new Date('01/01/2007') )
    {
        minimalReview.push(
        {
        'user_id' : d.user_id,
        'review_id' : d.review_id,
        'stars' : d.stars,
        'date' : d.date,
        'business_id' : d.business_id 
    	})
    }
})

//Write minimal reviews to JSON file
// fs.writeFileSync("funNewReviews.json", JSON.stringify(minimalReview,null,4))

//Create an array of all dates
var allDates = []
minimalReview.forEach(function(d){
    allDates.push((d.date));
});

//Create an array of all unique dates
var uniqueDates = allDates.filter(function(day, pos) {
    return allDates.indexOf(day) == pos;
    });  

//Sort the reviews by date array by date
uniqueDates.sort(function(a, b) {
    return (new Date(a) - new Date(b));
})

//Create an array for the counts of each date with an initial count of 0
var reviewsByDate = []

for (i=0; i<businessID.length; i++) {
    reviewsByDate.push(
        {
        'businessId' : businessID[i], 
        'countInfo' : [] 
        }
        )
	for (j=0; j<uniqueDates.length; j++) {
        reviewsByDate[i].countInfo.push(
            {
            'date' : uniqueDates[j],
            'count' : 0    
            }
            )
	}
}

//Loops through the reviews and increment the count for a particular date when it appears
for (i=0; i<reviewsByDate.length; i++) {
 for (j=0; j<uniqueDates.length; j++) {
     for (k=0; k<minimalReview.length; k++) {
         if (reviewsByDate[i].countInfo[j].date == minimalReview[k].date && reviewsByDate[i].businessId == minimalReview[k].business_id) {
             reviewsByDate[i].countInfo[j].count ++
         }
     }
 }
}

var notFunArray = []

reviewsByDate.forEach(function(d, i){
    notFunArray.push({ 'business_id': d.businessId,
                        'countInfo': [] })
    d.countInfo.forEach(function(e, j){

        if(reviewsByDate[i].countInfo[j].count != 0)
        {
            notFunArray[i].countInfo.push({'date': e.date,
                                            'count': e.count})
        }        
    })
})

fs.writeFileSync("funNewReviews.json", JSON.stringify(notFunArray,null,4))

console.log(notFunArray[100])
/*fs.writeFileSync("funNewreviewCount.json", JSON.stringify(notFunArray,null,4))*/


function reviewDictionary () {

    var numberOfWords = 50;

    //Create a blank array with the business ID and a blank text key
    var funNewArray = [];
    businessID.forEach(function(d){
        funNewArray.push({'business_id': d,
                            'text': "",
                            "topWords": []})
    })

    //Push the business id and all the review words to funNewArray
    //Remove all punctuation and convert all words to lowercase
    funNewArray.forEach(function(d){ //remove punctuation and other non letter characters, make all lowercase
        reviews.forEach(function(e){
            if (d.business_id == e.business_id)
            {
                d.text = d.text+" "+e.text.replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~\n']/g,"").toLowerCase();+" ";
                //possibly add in replacing ' with "" and rest with " "
            }
        })
    })

    // console.log(funNewArray[100])

    //Split the text string into a multiword array
    funNewArray.forEach(function(d){
        d.text = d.text.split(" ");

        d.text.sort();
    })

    // console.log(funNewArray[100])

    //Create an empty array which will contain the word, the number of occurences, and the average rating
    // var topWords = [];
    // topWords.push({"business_id" : "", "topWords" : [] })
    

    //Create an array of all the words and the counts
    for (var k = 0; k < funNewArray.length; k++)
    {
        funNewArray[k].topWords.push({"word" : "", "count" : 0, "rating" : 0})

        for (var i = 0; i < funNewArray[k].text.length; i++)
        {
            if(funNewArray[k].text[i].length >3 
                && funNewArray[k].text[i]!= 'that' 
                && funNewArray[k].text[i]!='this' 
                && funNewArray[k].text[i]!='they' 
                && funNewArray[k].text[i]!='with'
                && funNewArray[k].text[i]!='have'
                && funNewArray[k].text[i]!='there' 
                && funNewArray[k].text[i]!='also' 
                && funNewArray[k].text[i]!='were' 
                && funNewArray[k].text[i]!='from' 
                && funNewArray[k].text[i]!='about' 
                && funNewArray[k].text[i]!='here' 
                && funNewArray[k].text[i]!='then' 
                && funNewArray[k].text[i]!='their' ) {
                var current = funNewArray[k].text[i];
                break; }
        }
        var index = 0;
        var topTen = [];
        funNewArray[k].text.forEach(function(d, i){

            if (d.length > 3 
                && d != 'that' 
                && d!='this' 
                && d!='they' 
                && d!='with' 
                && d!='have'
                && d!='there' 
                && d!='also' 
                && d!='were' 
                && d!='from' 
                && d!='about' 
                && d!='here' 
                && d!='then' 
                && d!='their')
            {
                if(current == d)
                {
                    funNewArray[k].topWords[index].word = d;
                    funNewArray[k].topWords[index].count++;
                }
                else {
                    index++;
                    current = d;
                    funNewArray[k].topWords.push({'word': d,
                                    'count': 1,
                                    'rating': 0});
                }
            }
        })
    }

    //Sort the top words
    funNewArray.forEach(function(d) {
        d.topWords.sort(function(a,b) {
            return b.count - a.count
        })
    })

    //Only include top 50 words
    funNewArray.forEach(function(d) {
        d.topWords.splice(numberOfWords, d.topWords.length-numberOfWords);
    })

    var mostFunNewArray = [{"business_id" : "", "topWords" : []}]

    funNewArray.forEach(function(d) {
        mostFunNewArray.push({"business_id" : d.business_id, "topWords" : d.topWords})
    })

/*fs.writeFileSync("wordCloudDataNoRating2.json", JSON.stringify(mostFunNewArray,null,4))*/

}

/*reviewDictionary();*/




