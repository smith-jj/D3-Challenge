// @TODO: YOUR CODE HERE!
// Create makeResponsive function and wrap around chart 
function makeResponsive() {

    // Create svg area for chart
    var svgArea = d3.select("body").select("svg");

    // Clear svg is Not Empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set svg dimensions 
    var svgWidth = 880;
    var svgHeight = 500;

    // Set svg Margins
    var margin = {
        top: 20,
        right: 40,
        bottom: 90,
        left: 100
    };

    // Define dimensions for 
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Set svg Element/Wrapper - define plot type, append svg and dimensions 
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Create chartGroupGroup and set margins
    // Shift by Left and Top Margins Using Transform
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define initial params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // Create xScale function that updates the stateData when axis label is clicked
    function xScale(stateData, chosenXAxis) {
        // Define Scale Functions for the Chart (chosenXAxis)
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
                d3.max(stateData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
        return xLinearScale;
    }

    // Create yScale function that updates the stateData when axis label is clicked
    function yScale(stateData, chosenYAxis) {
        // Define Scale Functions for the Chart (chosenYAxis)
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
                d3.max(stateData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);
        return yLinearScale;
    }

    // Create renderXAxes function that updates the xAxis when axis label is clicked
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }

    // Create renderYAxes function that updates the yAxis when axis label is clicked
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        return yAxis;
    }

    // Create renderCircles function that updates and transitions circlesGroup when axis label is clicked
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // Create renderText function that updates and transitions textGroup when axis label is clicked
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]))
            .attr("text-anchor", "middle");

        return textGroup;
    }

    // Create updateToolTip function to update circlesGroup and textGroup 
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

        if (chosenXAxis === "poverty") {
            var xLabel = "Poverty (%)";
        } else if (chosenXAxis === "age") {
            var xLabel = "Age (Median)";
        } else {
            var xLabel = "Household Income (Median)";
        }
        if (chosenYAxis === "healthcare") {
            var yLabel = "Lacks Healthcare (%)";
        } else if (chosenYAxis === "obesity") {
            var yLabel = "Obese (%)";
        } else {
            var yLabel = "Smokes (%)";
        }

        // Initialize Tool Tip
        var toolTip = d3.tip()
            .attr("class", "tooltip d3-tip")
            .offset([90, 90])
            .html(function(d) {
                return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
            });
        // Call circlesGroup Tooltip in the Chart
        circlesGroup.call(toolTip);
        // Call Event Listeners to Display and Hide the circlesGroup Tooltip
        circlesGroup.on("mouseover", function(data) {
                toolTip.show(data, this);
            })
            // onmouseout Event
            .on("mouseout", function(data) {
                toolTip.hide(data);
            });
        // Call textGroup Tooltip in the Chart
        textGroup.call(toolTip);
        // Call Event Listeners to Display and Hide the Text Tooltip
        textGroup.on("mouseover", function(data) {
                toolTip.show(data, this);
            })
            // onmouseout Event
            .on("mouseout", function(data) {
                toolTip.hide(data);
            });
        return circlesGroup;
    }

    // Use D3 and .then function to import the data.csv infomration and 
    d3.csv("assets/data/data.csv")
        .then(function(stateData) {

            // Format/Parse the Data (Cast as Numbers)
            stateData.forEach(function(data) {
                data.poverty = +data.poverty;
                data.age = +data.age;
                data.income = +data.income;
                data.healthcare = +data.healthcare;
                data.obesity = +data.obesity;
                data.smokes = +data.smokes;
            });

            // Define xLinearScale & yLinearScale Functions for the Chart
            var xLinearScale = xScale(stateData, chosenXAxis);
            var yLinearScale = yScale(stateData, chosenYAxis);

            // Define Axis Functions for the Chart
            var bottomAxis = d3.axisBottom(xLinearScale);
            var leftAxis = d3.axisLeft(yLinearScale);

            // Append xAxis to the Chart
            var xAxis = chartGroup.append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${height})`)
                .call(bottomAxis);

            // Append yAxis to the Chart
            var yAxis = chartGroup.append("g")
                .classed("y-axis", true)
                .call(leftAxis);

            // Define circlesGroup and append attributes for stateCircles
            var circlesGroup = chartGroup.selectAll(".stateCircle")
                .data(stateData)
                .enter()
                .append("circle")
                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                .attr("class", "stateCircle")
                .attr("r", 15)
                .attr("opacity", ".75");

            // Define textGroup and add text attribute to stateCircle 
            var textGroup = chartGroup.selectAll(".stateText")
                .data(stateData)
                .enter()
                .append("text")
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d[chosenYAxis] * .98))
                .text(d => (d.abbr))
                .attr("class", "stateText")
                .attr("font-size", "12px")
                .attr("text-anchor", "middle")
                .attr("fill", "white");

            // Define xLabelsGroup for three xAxis Labels
            var xLabelsGroup = chartGroup.append("g")
                .attr("transform", `translate(${width / 2}, ${height + 20})`);
            // Append xAxis
            var povertyLabel = xLabelsGroup.append("text")
                .attr("x", 0)
                .attr("y", 20)
                .attr("value", "poverty") // Value for Event Listener
                .classed("active", true)
                .text("In Poverty (%)");

            var ageLabel = xLabelsGroup.append("text")
                .attr("x", 0)
                .attr("y", 40)
                .attr("value", "age") // Value for Event Listener
                .classed("inactive", true)
                .text("Age (Median)");

            var incomeLabel = xLabelsGroup.append("text")
                .attr("x", 0)
                .attr("y", 60)
                .attr("value", "income") // Value for Event Listener
                .classed("inactive", true)
                .text("Household Income (Median)");

            // Define yLabelsGroup for three yAxis Labels
            var yLabelsGroup = chartGroup.append("g")
                .attr("transform", `translate(-25, ${height / 2})`);
            // Append yAxis
            var healthcareLabel = yLabelsGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -30)
                .attr("x", 0)
                .attr("value", "healthcare")
                .attr("dy", "1em")
                .classed("axis-text", true)
                .classed("active", true)
                .text("Lacks Healthcare (%)");

            var smokesLabel = yLabelsGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -50)
                .attr("x", 0)
                .attr("value", "smokes")
                .attr("dy", "1em")
                .classed("axis-text", true)
                .classed("inactive", true)
                .text("Smokes (%)");

            var obesityLabel = yLabelsGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -70)
                .attr("x", 0)
                .attr("value", "obesity")
                .attr("dy", "1em")
                .classed("axis-text", true)
                .classed("inactive", true)
                .text("Obese (%)");

            // updateToolTip Function
            var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

            // xAxis Labels Event Listener
            xLabelsGroup.selectAll("text")
                .on("click", function() {
                    // Define value of Selection
                    var value = d3.select(this).attr("value");
                    if (value !== chosenXAxis) {
                        // Replaces chosenXAxis with value
                        chosenXAxis = value;
                        // Updates xScale for new data
                        xLinearScale = xScale(stateData, chosenXAxis);
                        // Transition for xAxis 
                        xAxis = renderXAxes(xLinearScale, xAxis);
                        // Updates circlesGroup with new values
                        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                        // Updates textGroup with new values
                        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                            // Updates Tooltips 
                        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                        // Changes Classes to Change Bold Text
                        if (chosenXAxis === "poverty") {
                            povertyLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        } else if (chosenXAxis === "age") {
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            ageLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        } else {
                            povertyLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            ageLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            incomeLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }
                    }
                });

            // yAxis Labels Event Listener
            yLabelsGroup.selectAll("text")
                .on("click", function() {
                    // Get Value of Selection
                    var value = d3.select(this).attr("value");
                    if (value !== chosenYAxis) {
                        // Replaces chosenYAxis with value
                        chosenYAxis = value;
                        // Updates yScale for new data
                        yLinearScale = yScale(stateData, chosenYAxis);
                        // Transition for yAxis 
                        yAxis = renderYAxes(yLinearScale, yAxis);
                        // Updates circlesGroup with new values
                        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                        // Updates textGroup with new values
                        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                            // Updates Tooltips 
                        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                        // Changes Classes to Change Bold Text
                        if (chosenYAxis === "healthcare") {
                            healthcareLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            smokesLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        } else if (chosenYAxis === "obesity") {
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                        } else {
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            smokesLabel
                                .classed("active", true)
                                .classed("inactive", false);
                        }
                    }
                });
        });
}
// When Browser loads, makeResponsive() is Called
makeResponsive();

// When Browser Window is resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);