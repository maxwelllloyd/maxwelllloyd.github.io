
ReviewVis = function(_parentElement, _mapData, _reviewData, _businessData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.eventHandler = _eventHandler;

    this.margin = {top:25, right:50, bottom:50, left:25};
    this.width = 700 - this.margin.left - this.margin.right
    this.height = 400 - this.margin.top - this.margin.bottom

	this.initVis();
}

ReviewVis.prototype.initVis = function() {

	var that=this

   this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("text")
        .attr("class","title")
        .text("Content of Reviews")
}

ReviewVis.prototype.updateVis = function() {


    //Create world cloud

}

ReviewVis.prototype.onSelectionChange = function () {

    //call wrangle data function and pass in business from force layout click

}


ReviewVis.prototype.wrangleData = function() {

    //Implement data filters
}

ReviewVis.prototype.filterAndAggregate = function() {

    //Implement filters

}