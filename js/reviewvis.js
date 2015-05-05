
ReviewVis = function(_parentElement, _mapData, _reviewData, _businessData, _wordData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.eventHandler = _eventHandler;
    this.rawWordData = _wordData;
    
    this.business_id
    this.selectedBusiness
    this.wordData = [];

    this.metaData =[];

    //Define SVG
    this.margin = {top:25, right:50, bottom:50, left:25};
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    //Define scales
    this.countScale = d3.scale.linear().range([10, 100]);
    this.ratingScale = d3.scale.ordinal().range(d3.range(5));

	this.initVis();
}

ReviewVis.prototype.initVis = function() {

   var that=this

   this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .attr("position", "fixed");

    this.svg.append("text")
        .attr("class","title")
        .attr("x", -20)
        .attr("y", -5)
        .text("Selected Business Information:")



}

ReviewVis.prototype.updateVis = function() {

    var that = this
    var fill = d3.scale.category10();

    //Remove old information
    d3.select("#summary").remove();
    d3.selectAll(".information").remove();

    //Append business information
    this.legend = this.svg.append("g")
            .attr('transform', 'translate(-20,-10)').selectAll("text")
            .data(this.selectedBusiness)
            .enter()                    

    this.legend
        .append("text") 
        .attr("class", "information")
        .attr("id", "summary")
        .attr("x", 0)
        .attr("y", function(d,i) {
            return i*15 + 20
        })
        .text(function(d) {
            return d
        })

   //Create world cloud
    var that = this;

    //WordCloud library from Jason Davies github https://github.com/jasondavies/d3-cloud
    d3.layout.cloud().size([600, 300])
      .words(this.wordData.map(function(d, i) {
        return {text: d, size:  that.metaData[i].count};
        }))
      .padding(5)
      .rotate(function() { return ~~(Math.random() * 2) * 45; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();
      
  function draw(words) {

    that.svg
        .append("g")
        .attr("transform", "translate(260,225)")
        .selectAll("text")
        .data(words)
        .enter().append("text").transition().duration(450)
        .attr("class", "information")      
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i/*that.metaData[i].rating*/); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
        }

}


ReviewVis.prototype.onSelectionChange = function (business_id) {

    //call wrangle data function and pass in business from force layout click
    this.business_id = business_id
    this.wrangleData()

}


ReviewVis.prototype.wrangleData = function() {

    var that = this

    //Implement data filters
    this.businessData.forEach(function(d) {
        if (d.business_id == that.business_id) {
            that.business = ["Name: " + d.name, d.full_address, "Stars: " + d.stars, "Reviews: " + d.review_count]
        }
    })

    //Remove HTML formatting from address
    this.address = this.business[1].split("\n")

    //Create new address format with commas
    this.newAddress = this.address.join(", ")

    //Create selected business array with updated address
    this.selectedBusiness = [this.business[0], "Address: " + this.newAddress, this.business[2], this.business[3]]

    //Process raw word data
    this.rawWordData.forEach(function(d){
        if(d.business_id == that.business_id)
        {
            that.metaData = d.topWords;
            that.metaData.forEach(function(e, i){
                e.count = d.topWords[i].count;
                e.rating = d.topWords[i].rating;
            })
            for (var k = 0; k < d.topWords.length; k++)
                that.wordData[k] = d.topWords[k].word;
        }
    })
    //update scales
    this.countScale.domain(d3.extent(this.metaData, function(d){ return d.count}))
    this.ratingScale.range([0,5]).domain([0, 5])     

    //process the cloud array and also the meta data for each word
            that.metaData.forEach(function(e, i){
                e.count = that.countScale(e.count);
                e.rating = ~~that.ratingScale(e.rating);
            })

    this.updateVis();

}

