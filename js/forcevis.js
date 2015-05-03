
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

    //Go to init vis
    this.initVis();

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
        .text("Selected Businesses:")

    this.svg.append("text")
        .attr("class", "subheading")
        .attr("x", -20)
        .attr("y", -10)
        .text("(click node for more information)")

    //Add legend
    // this.legend = this.svg.selectAll(".legend")
    //     .data(this.allCategories)
    //     .enter()
    //     .append("g")
    //     .attr("class", "legend")
    //     .attr('transform', 'translate(600,-30)') 

    // this.legend.append("rect")
    //     .attr("width", 20)
    //     .attr("height", 20)
    //     .attr("class", function(d){
    //         return that.colorScale(d)
    //         })

    // this.legend.append("text")
    //     .attr("x", 50)
    //     .attr("y", function(d,i) {
    //         return i*10
    //     })
    //     .text(function(d) {
    //         return d
    //     })




    this.legend = this.svg.append("g")
        // .attr("class", "legend")
        // .attr("height", 200)
        // .attr("width", 100)
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


    //Set initial value of unique categories
    this.uniqueCategories = this.categoryData

    //Go to update vis with initial data
    this.nodeData = this.businessData
    this.updateVis()

}

ForceVis.prototype.updateVis = function() {

    var that = this

    // //Set nodegroup variable
    // this.grouping = nodeGroup
    // console.log(this.grouping)

    //Set node data equal to what is being passed into updateVis
    // this.nodeData = data

    // //Update scales
    // this.categoryScale.domain(this.uniqueCategories)

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
        .attr("r", function(d) { 
            if (that.nodeData.length > 200) return 3
            else return 5
        })
        .attr("class", function(d){
            return that.colorScale(d.category)
            })
        .on("mouseover", this.tip.show)
        .on("mouseout", this.tip.hide)

    node
        .append("text")
        .attr("dx", 5)
        .attr("dy", ".35em")
        // .text(function(d) { 
        //     if (that.nodeData.length < 50) 
        //         return d.name
        //     })

    // node
    //     .append("text")
    //     .attr("x",7)
    //     .attr("y",3)
    //     .attr("stroke","none")
    //     .attr("fill","black")
    //     .attr("font-weight","normal")
    //     .attr("font-size","10px")
    //     .attr("class", "label")
    //     .html(function(d){
    //         if (that.nodeData.length>50) return 
    //         else return d.name})

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
            if (that.nodeData.length >200) return -5
            else return -30
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
        // var k = 0.1 * d.alpha
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

    //Update function called from tick function 
    // function forceUpdate(dur) {
    //     node
    //         .transition()
    //         .duration(dur)
    //         .attr("transform", function(d) { 
    //             return "translate("+d.x+","+d.y+")";});        
    // }

    //Call initial force layout
    forceLayout();


    //Create event handler for force grouping
    //Create event handler for force coloring
    //Create event handler for force clicking


}

ForceVis.prototype.onDropDownChange = function(nodeGroup) {

    this.nodeGroup = nodeGroup
    this.updateVis();

}

ForceVis.prototype.onSelectionChange = function (selectedBusinesses) {

    //call wrangle data function and pass in filters from brushed

    //Create variable for brushed busineseses
    this.selectedBusinesses=selectedBusinesses

    //Call wrangleData
    this.wrangleData()
}


ForceVis.prototype.wrangleData = function() {

    var that = this

    //Create an array for filtered businesses    
    this.filterBusinesses = []

    
    //Implement data filters
    this.businessData.forEach(function(d) {
      that.selectedBusinesses.forEach(function(e) {
        if(d.business_id == e) {
            that.filterBusinesses.push(d)
        }
      })
    })

    //Create an array of the unique categories in the filtered data
    this.categories = []
    this.uniqueCategories = []

    this.filterBusinesses.forEach(function(d) {
            that.categories.push(d.category)
        })

    this.uniqueCategories = this.categories.filter(function(elem, pos) {
        return that.categories.indexOf(elem) == pos;
        });

    this.nodeData = this.filterBusinesses
    this.updateVis()

}

ForceVis.prototype.filterAndAggregate = function() {

    //Implement filters
}

