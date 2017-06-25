const width = $("#arena").width();
const height = 700;

//When doc loaded:
document.addEventListener("DOMContentLoaded", function() {
  var arena = d3.select("#arena")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

  var req = new XMLHttpRequest();
  req.open("GET", "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json");
  req.send();

  req.onload = function() {
    var json = JSON.parse(req.response);
    var nodes = json.nodes;
    var links = json.links;

    var pass = true;
    //Force Layout Code:
    var ticked = function() {
      node
        .style("left", (d) => (d.x - 8) + "px")
        .style("top", (d) => (d.y - 5) + "px");

      link
        .attr("x1", link => link.source.x)
        .attr("y1", link => link.source.y)
        .attr("x2", link => link.target.x)
        .attr("y2", link => link.target.y);
    }

    var simu = d3.forceSimulation(nodes)
      .force("centralize", d3.forceCenter(width/2, height/2))
      .force("x", d3.forceX(width/2).strength(0.005))
      .force("y", d3.forceY(height/2).strength(0.005))
      .force("non-overlap", d3.forceCollide(20))
      .force("link", d3.forceLink().links(links))
      .on("tick", ticked);

    const dragDrop = d3.drag()
      .on("start", d => {
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", node => {
        simu.alphaTarget(0.7).restart();
        node.fx = d3.event.x;
        node.fy = d3.event.y;

        document.getElementById("tooltip").style.top = d3.event.sourceEvent.pageY;
        document.getElementById("tooltip").style.left = d3.event.sourceEvent.pageX;
      })
      .on("end", node => {
        document.getElementById("tooltip").style.display = "none";
        if (!d3.event.active) {
          simu.alphaTarget(0);
        }
        node.fx = null;
        node.fy = null;
      });

    var node = d3.select("#sprite").selectAll(".node").data(nodes)
      .enter().append("img")
      .attr("class", "point")
      .attr("class", d => "flag-" + d.code + " flag")
      .on("mouseover", function() {
        var t = document.getElementById("tooltip");
        t.style.display = "block";
        t.style.left = (d3.event.pageX + 15) + "px";
        t.style.top = d3.event.pageY + "px";
        t.innerHTML = this["__data__"].country;
      })
      .on("mouseout", function() {
        document.getElementById("tooltip").style.display = "none";
      })
      .call(dragDrop);

    var link = arena.selectAll("line").data(links).enter().append("line")
      .attr("stroke-width", 1)
      .attr("stroke", "black");
  }
});
