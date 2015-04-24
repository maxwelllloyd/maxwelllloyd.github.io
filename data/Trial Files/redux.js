
var reducedData;
 
var modifyData = function(){

  $.getJSON('perDayData.json', function(d){
    var result;
  	


    console.log(d);
    console.log("in it");
    reducedData = result;
  });
};
modifyData();