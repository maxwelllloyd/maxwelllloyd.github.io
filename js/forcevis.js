
ForceVis = function(_parentElement, _mapData, _nodeGroup, _businessData, _categoryData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.nodeGroup = _nodeGroup;
    this.categoryData = _categoryData;
    this.allCategories = _categoryData
    this.eventHandler = _eventHandler;

    var that = this

    this.margin = {top:100, right:50, bottom:25, left:25};
    this.width = 820 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    //Set up scales
    this.starScale = d3.scale.quantize()
        .domain([1,5])
        .range(d3.range(5)
        .map(function(d) { return "q" + d + "-5"; }));

    this.colorScale = d3.scale.ordinal()
        .domain(that.categoryData)
        .range(d3.range(10)
        .map(function(d) { return "v" + d + "-10"; }));

    this.categoryScale = d3.scale.ordinal().rangeRoundBands([0,this.width])

    //Set initial value of unique categories
    this.uniqueCategories = this.categoryData;

    // console.log(this.uniqueCategories)

    //Go to update vis with initial data
    this.nodeData = this.businessData;

    //Set selected businesses equal to all individually
    this.selectedBusinesses = [];

    this.businessData.forEach(function(d){
        that.selectedBusinesses.push(d.business_id)
    })

    //Set initial drop down
    this.nodeGroup = "none"
    this.mapBy = "all"
    this.filteredData = this.businessData

    //Go to init vis
    this.initVis();

}

ForceVis.prototype.onDropDownChange = function(nodeGroup, mapBy) {

    var that = this;

    //Set drop down variables
    this.nodeGroup = nodeGroup;
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
            this.nodeData = this.businessData;
            filtered = that.nodeData.filter(businessCategory);
        } 
    this.filteredData = filtered;

    this.wrangleData();
}

ForceVis.prototype.onSelectionChange = function (selectedBusinesses) {

    //Create variable for brushed busineseses
    this.selectedBusinesses=selectedBusinesses;

    //Set node data equal to all the businesses
    this.nodeData = this.businessData;

    //Call wrangleData
    this.wrangleData();
}

ForceVis.prototype.wrangleData = function() {

    var that = this

    //Create an array for filtered businesses    
    this.filterBusinesses = []
    
    //Implement data filters
    this.filteredData.forEach(function(d) {
      that.selectedBusinesses.forEach(function(e) {
        if(d.business_id == e) {
            that.filterBusinesses.push(d)
        }
      })
    })

    //Create an array of the unique categories in the filtered data
    this.categories = [];
    this.uniqueCategories = [];

    this.filterBusinesses.forEach(function(d) {
            that.categories.push(d.category);
        });

    this.uniqueCategories = this.categories.filter(function(elem, pos) {
        return that.categories.indexOf(elem) == pos;
        });

    //Set node data equal to filtered businesses
    this.nodeData = this.filterBusinesses;

    //Update vis
    this.updateVis();

}

ForceVis.prototype.initVis = function() {

	var that=this

    //Define SVG element
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        // .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    //Create title for SVG
    this.svg.append("text")
        .attr("class","title")
        .attr("x", -20)
        .attr("y", -25)
        .text("Brushed Businesses:")

    this.svg.append("text")
        .attr("class", "subheading")
        .attr("x", -20)
        .attr("y", -10)
        .text("(click node for more information)")

    //Add legend
    this.legend = this.svg.append("g")
        .attr('transform', 'translate(600,-30)') 

    this.legend.selectAll("rect")
        .data(this.allCategories)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("x", 20)
        .attr("y", function(d,i) {
            return i*10-10
        })
        .attr("class", function(d){
            return that.colorScale(d)
            })

    this.legend.selectAll("text")
        .data(this.allCategories)
        .enter()
        .append("text")
        .attr("class", "legendtext")
        .attr("x", 50)
        .attr("y", function(d,i) {
            return i*10
        })
        .text(function(d) {
            return d
        })

    //Add tooltip
    this.tip = d3.tip()
        .attr("class","tooltip")
        .offset([-10,0])
        .html(function(d) {
            return "Name: " + d.name
        })

    this.svg.call(this.tip)

    this.updateVis();

}

ForceVis.prototype.updateVis = function() {

    var that = this

    //Update scales
    this.categoryScale.domain(this.uniqueCategories)

    //Define nodes
    var node = this.svg.selectAll(".node")
      .data(that.nodeData)

    //Add nodes
    node
        .enter()
        .append("g")
        .attr("class", "node");

    //Remove nodes
    node
        .exit()
        .remove();

    //Update node information
    node
        .append("circle")
        .attr("class", function(d){
            return that.colorScale(d.category)
            })
        .on("mouseover", this.tip.show)
        .on("mouseout", this.tip.hide)
    
    node
        .selectAll("circle")
        .attr("r", function(d) { 
            if (that.nodeData.length > 200) 
                return 3;
            else return 5;
        })

    //Node interactivity
    node.on("click", function(d) {
        d3.select(this).select("circle").classed("node--selected")
        $(that.eventHandler).trigger("selectionChanged", d.business_id)
    })

    // Start force layout
    function forceLayout(d){
        force
            .nodes(that.nodeData)
            .start()
    }

    //Define force
    var force = d3.layout.force()
        .size([that.width, that.height])
        // .linkStrength(0.1)
        // .friction(0.9)
        .linkDistance(10)
        // .charge(-10)
        .charge(function() {
            if (that.nodeData.length >300) return -3
            else return -20
            })
        // .gravity(0.1)
        // .theta(0.8)
        // .alpha(0.1)
        .on("tick", tick)
        .on("start", function(d) {})
        .on("end", function(d) {});

    //Create horizontal force layout foci
    function create_horizontal_foci() {

        var foci_scale = d3.scale.ordinal()
                            .rangeRoundBands([-that.width/4,that.width/3])        
                            .domain(d3.range(that.uniqueCategories.length))

        return that.uniqueCategories.map(function(d,i) {
            return {x: foci_scale(i), y:0}
        })
    }

    //Define tick function
    function tick (d){

        graph_update(0,d)
        
    }

    function graph_update(duration, d) {

        var k=0.1*d.alpha

        var foci = d3.range(that.uniqueCategories.length).map(function() {
            return {x: 0, y: 0};
          })    

        if (that.nodeGroup == "category") {
            foci = create_horizontal_foci()
        }

        that.nodeData.forEach(function(d) {
                d.x += (foci[that.uniqueCategories.indexOf(d.category)].x) * k
                d.y += (foci[that.uniqueCategories.indexOf(d.category)].y) * k  
            })

        that.svg.selectAll(".node")
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                 return "translate("+d.x+","+d.y+")"
            })

    }

    //Call initial force layout
    forceLayout();

}




