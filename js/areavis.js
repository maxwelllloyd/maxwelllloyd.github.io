
AreaVis = function(_parentElement, _reviewData, _businessData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.eventHandler = _eventHandler;

    this.margin = {top:25, right:25, bottom:50, left:50};
    this.width = 700 - this.margin.left - this.margin.right
    this.height = 400 - this.margin.top - this.margin.bottom

    this.dateFormat = d3.time.format("%d-%m-%Y");
    
    this.reviewsByDate = []

    //Set initial map to all of businesses
    this.mapBy == "all"

    var that = this

    //Initially set drop down data equal to all of the businesses
    this.filteredData = []
    this.businessData.forEach(function(d) {
        that.filteredData.push(d)
    })

    //Initially set selected businesses equal to all of the ids
    this.selectedBusinesses = []
    this.businessData.forEach(function(d) {
        that.selectedBusinesses.push(d.business_id)
    })

	this.initVis();

}

AreaVis.prototype.initVis = function() {

	var that=this

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.svg.append("text")
        .attr("class","title")
        .attr("x", -20)
        .attr("y", -5)
        .text("Brushed Businesses - Reviews Over Time:")


    //Set up x scale
    this.x = d3.time.scale()
            .range([0,this.width]);

    //Set up y scale
    this.y = d3.scale.linear()
            .range([this.height, 0]);

    //Set up x axis
    this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient("bottom");

    //Set up y axis
    this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("left");

    //Define area graph
    this.area = d3.svg.area()
            .x(function (d){ return that.x(d.date)})
            .y0(this.height)
            .y1(function (d){ return that.y(d.count)})
            .interpolate("monotone")

    //Append x axis
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    //Append y axis
    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Daily Review Count");

    this.filterAndAggregate(this.reviewData);
}

AreaVis.prototype.updateVis = function(_data) {
    var that = this;

    var graphData = _data;
    
    

    //Set up x and y scale domains
    this.x.domain(d3.extent(graphData, function(d) { return new Date(d.date); }));
    
    var yMax = d3.max(graphData, function(d) {return d.count})
    if(yMax < 10)
    {
        yMax = 10;
    }
    this.y.domain([0,yMax])
    
    //Call axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")

    this.svg.select(".y.axis")
        .call(this.yAxis)

    //Updates path
    var path = this.svg.selectAll(".area")
      .data([graphData])

    path.enter()
      .append("path")
      .attr("class", "area")

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();

}


AreaVis.prototype.onDropDownChange = function(mapBy) {

    var that = this;

    //Set drop down variables
    this.mapBy = mapBy;

    //Implement data filtering
    function businessCategory(d) {
        return d.category === that.mapBy
    }

    var filtered = []
    if (this.mapBy == "all") {
        filtered = this.businessData;
    }
    else {
        filtered = that.businessData.filter(businessCategory);
        } 

    this.filteredData = filtered;

    this.wrangleData();

}

AreaVis.prototype.onSelectionChange = function (selectedBusinesses) {

    //Create array of brushed businesses
    this.selectedBusinesses = selectedBusinesses

    //Call wrangle data
    this.wrangleData()
        
}

AreaVis.prototype.wrangleData = function() {
    var that = this;

    //Create an array for filtered reviews
    this.filterReviews = []
    this.filterReviewsUpdated = []

    //Find reviews that match selected businesses
    this.reviewData.forEach(function(d) {
        that.selectedBusinesses.forEach(function(e) {
            if (d.business_id == e) {
                that.filterReviews.push(d)
            }
        })
    })

    //Find reviews that are in the correct category
    this.filterReviews.forEach(function(d) {
        that.filteredData.forEach(function(e) {
            if (d.business_id == e.business_id) {
                that.filterReviewsUpdated.push(d)
            }
        })
    })

    //Call filter and aggregate
    this.filterAndAggregate(this.filterReviewsUpdated)

}

AreaVis.prototype.filterAndAggregate = function(data) {

    var that = this;

    var reviewsByDate = []
    var dateArray = []
    var uniqueDate = []

    //Create a data variable
    this.data = data

    //Push all of the dates of data to an array
    this.data.forEach(function(d){
        d.countInfo.forEach(function(e){
            dateArray.push(e.date);             
        })
    });

    //Create an array of unique dates and sort
    uniqueDate = dateArray.filter(function(elem, pos) {
        return dateArray.indexOf(elem) == pos;
        }); 

    uniqueDate.sort(function(a, b){
        return new Date(a) - new Date(b);
    }); 

    //Create an empty array which will be filled with the count of reviews for dates
    uniqueDate.forEach(function(d){
        reviewsByDate.push({'date': d,
                            'count': 0})
    });


    //Add up all the reviews on each unique date
    this.data.forEach(function(d) {
        d.countInfo.forEach(function(e) {
            reviewsByDate.forEach(function(f) { 
                if (e.date == f.date) {
                    f.count += e.count
                }
            })
        })
    })

    reviewsByDate.forEach(function(d){
        d.date = new Date(d.date)
    })

    //Call update vis
    this.updateVis(reviewsByDate);
}