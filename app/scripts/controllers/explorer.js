'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('ExplorerCtrl', function () {

  })
  .directive('d3graph', ['$http', function ($http) {

    var directive = {};
    directive.restrict = 'A';
    directive.replace = false;
    directive.link = function (scope, elements, attr) {

      /*var width = 960,
        height = 700;

      var color = d3.scale.category20();

      var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

      var svg = d3.select(elements[0]).append("svg")
        .attr("width", width)
        .attr("height", height);

      d3.json("data/miserables.json", function (error, graph) {
        force // tell force layout to use the links as the invisible nodes
          .nodes(graph.nodes.concat(graph.links))
          .links(graph.links)
          .start();

        var link = svg.selectAll(".link")
          .data(graph.links)
          .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", function (d) {
            return Math.sqrt(d.value);
          });

        var node = svg.selectAll(".node")
          .data(graph.nodes)
          .enter().append("circle")
          .attr("class", "node")
          .attr("r", 10)
          .style("fill", function (d) {
            return color(d.group);
          })
          .call(force.drag);

        force.on("tick", function () {
          // place the invisible nodes at the halfway point of the link
          graph.links.forEach(function (d, i) {
            var x1 = d.source.x,
              x2 = d.target.x,
              y1 = d.source.y,
              y2 = d.target.y,
              slope = (y2 - y1) / (x2 - x1);

            d.x = (x2 + x1) / 2;
            d.y = (x2 - x1) * slope / 2 + y1;

          });

          link.attr("x1", function (d) {
            return d.source.x;
          })
            .attr("y1", function (d) {
              return d.source.y;
            })
            .attr("x2", function (d) {
              return d.target.x;
            })
            .attr("y2", function (d) {
              return d.target.y;
            });

          node.attr("cx", function (d) {
            return d.x;
          })
            .attr("cy", function (d) {
              return d.y;
            });
        });
      });*/

      var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        active = d3.select(null);

      var g = svg.append("g")
        .attr("class", "everything");
      var color = d3.scaleOrdinal(d3.schemeCategory20);


      //add zoom capabilities
      var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions);

      zoom_handler(svg);

      var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

      var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
          return d.id;
        }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

      d3.json("data/graph.json", function (error, graph) {
        if (error) throw error;

        var link = g.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter().append("line")
          .attr("stroke-width", function (d) {
            return Math.sqrt(d.value);
          });

        var node = g.append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(graph.nodes)
          .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function (d) {
            return color(d.group);
          })
          .on("click", clicked)
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        var label = g.selectAll(".mytext")
          .data(graph.nodes)
          .enter()
          .append("text")
          .text(function (d) {
            return d.id
          })
          .style("text-anchor", "middle")
          .style("fill", "#555")
          .style("font-family", "Arial")
          .style("font-size", 3);


        simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(graph.links);

        function ticked() {
          link
            .attr("x1", function (d) {
              return d.source.x;
            })
            .attr("y1", function (d) {
              return d.source.y;
            })
            .attr("x2", function (d) {
              return d.target.x;
            })
            .attr("y2", function (d) {
              return d.target.y;
            });

          node
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });


          label.attr("x", function (d) {
            return d.x;
          })
            .attr("y", function (d) {
              return d.y - 10;
            });
        }
      });

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      function clicked(d) {
        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);


        var bbox = active.node().getBBox(),
          bounds = [[bbox.x, bbox.y], [bbox.x + bbox.width, bbox.y + bbox.height]],
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
          translate = [width / 2 - scale * x, height / 2 - scale * y];

        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

      }

//Zoom functions
      function zoom_actions() {
        g.attr("transform", d3.event.transform)
      }

      function reset() {
        active.classed("active", false);
        active = d3.select(null);

        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      }

      function zoomed() {
        g.style("stroke-width", 0.5 / d3.event.transform.k + "px");
        // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
        g.attr("transform", d3.event.transform); // updated for d3 v4
      }

    };
    return directive;
  }]);
