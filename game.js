function GameOfLife(width,height) {
  this.width = width;
  this.height = height;
  this.autoPlayInterval = false;
}

GameOfLife.prototype.createAndShowBoard = function () {
  // create <table> element
  var goltable = document.createElement("tbody");

  // build Table HTML
  var tablehtml = '';
  for (var h=0; h<this.height; h++) {
    tablehtml += "<tr id='row+" + h + "'>";
    for (var w=0; w<this.width; w++) {
      tablehtml += "<td data-status='dead' data-next-status='' id='" + w + "-" + h + "'></td>";
    }
    tablehtml += "</tr>";
  }
  goltable.innerHTML = tablehtml;

  // add table to the #board element
  var board = document.getElementById('board');
  board.appendChild(goltable);

  // once html elements are added to the page, attach events to them
  this.setupBoardEvents();
};

GameOfLife.prototype.setupBoardEvents = function() {
  // each board cell has an CSS id in the format of: "x-y"
  // where x is the x-coordinate and y the y-coordinate
  // use this fact to loop through all the ids and assign
  // them "on-click" events that allow a user to click on
  // cells to setup the initial state of the game
  // before clicking "Step" or "Auto-Play"

  // clicking on a cell should toggle the cell between "alive" & "dead"
  // for ex: an "alive" cell be colored "blue", a dead cell could stay white

  // EXAMPLE FOR ONE CELL
  // Here is how we would catch a click event on just the 0-0 cell
  // You need to add the click event on EVERY cell on the board

  var onCellClick = function (cell) {
    // set the status of the cell when it's clicked
    if (cell.getAttribute('data-status') == 'dead') {
      cell.className = "alive";
      cell.setAttribute('data-status', 'alive');
    } else {
      cell.className = "dead";
      cell.setAttribute('data-status', 'dead');
    }
  };

  // set on-click events for cells and buttons
  var thetable = document.getElementById('board');
  thetable.onclick = function(event) {
    var cellClicked = event.toElement;
    onCellClick(cellClicked);
  }

  var step_btn = document.getElementById('step_btn');
  if (step_btn !== null) {
    var self = this;
    step_btn.onclick = function() { self.step(); };
  }

  var autoplay_btn = document.getElementById('autoplay_btn');
  if (autoplay_btn !== null) {
    var self = this;
    autoplay_btn.onclick = function() { self.enableAutoPlay(); };
  }

  var reset_btn = document.getElementById('reset_btn');
  if (reset_btn !== null) {
    var self = this;
    reset_btn.onclick = function() { self.resetRandom(); };
  }

  var clear_btn = document.getElementById('clear_btn');
  if (clear_btn !== null) {
    var self = this;
    clear_btn.onclick = function() {self.clearTable();};
  }

};

// reset board to random cells alive or dead
GameOfLife.prototype.resetRandom = function() {
  this.mapAllCells(function(cell) {
    if (Math.random() <= .5) {
      cell.setAttribute("data-status", "alive");
      cell.className = "alive";
    }
  });
}

// a handy map function to apply a function to all cells on board
GameOfLife.prototype.mapAllCells = function(functionToApplyToEachCell) {
  // nested for-loop to loop through all cells
  for(var x = 0; x < this.width; x++) {
    for(var y = 0; y < this.height; y++) {
      var currentCell = document.getElementById(x+'-'+y);
      if (currentCell !== null) {
        functionToApplyToEachCell(currentCell);
      }
    }
  }
};



GameOfLife.prototype.step = function () {
  // Here is where we want to loop through all the cells
  // on the board and determine, based on its neighbors,
  // whether the cell should be dead or alive in the next
  // evolution of the game

  // nested for-loop to loop through all cells
  for(var x = 0; x < this.width; x++) {
    for(var y = 0; y < this.height; y++) {

      var num_neighbors = 0;
      // nested for-loop to loop through a cell's neighbors
      for(var i = -1; i<= 1; i++) {
        for(var j = -1; j<=1; j++) {
          var cellid = (x+i)+"-"+(y+j);
          var cellToCheck = document.getElementById(cellid);
          // check and count only cells that are in table and don't count itself
          if (!(i==0 && j==0) &&
              cellToCheck !== null &&
              cellToCheck.getAttribute('data-status') == "alive"
              ) {
                num_neighbors++;
          }
        }
      }

      var currentCell = document.getElementById(x+'-'+y);
      var currentCellStatus = currentCell.getAttribute('data-status');
      var newCellStatus = this.getNewCellStatus(currentCellStatus, num_neighbors);
      currentCell.setAttribute('data-next-status',newCellStatus);
      currentCell.className = newCellStatus;
    }
  }
  this.mapAllCells(function(cell) {
    cell.setAttribute("data-status", cell.getAttribute("data-next-status"));
    cell.setAttribute("data-next-status", "");
  });

};

// set cell status according to rules of Game of Life
GameOfLife.prototype.getNewCellStatus = function(currentCellStatus, num_neighbors) {
  if ((num_neighbors < 2 || num_neighbors > 3) && currentCellStatus=="alive") {
    return "dead";
  } else if (currentCellStatus=="dead" && num_neighbors == 3){
    return "alive";
  } else {
    return currentCellStatus;
  }
};

GameOfLife.prototype.enableAutoPlay = function () {
  // Start Auto-Play by running the 'step' function
  // automatically repeatedly every fixed time interval
  var self = this;
  if (!this.autoPlayInterval) {
    this.autoPlayInterval = window.setInterval(function() {
      self.step();
    }, 200);
    var autoplay_btn = document.getElementById('autoplay_btn');
    // if autoplay is on, automatically change autoplay btn to pause btn
    if (autoplay_btn !== null) {
      autoplay_btn.className = "btn btn-danger";
      autoplay_btn.innerHTML = "Pause";
    }
  } else {
    window.clearInterval(this.autoPlayInterval);
    this.autoPlayInterval = false;
    var autoplay_btn = document.getElementById('autoplay_btn');
    if (autoplay_btn !== null) {
      autoplay_btn.className = "btn btn-primary";
      autoplay_btn.innerHTML = "Auto-Play";
    };
  };
};

// reset and clear the table
GameOfLife.prototype.clearTable = function () {
  var self = this;
  var autoplay_btn = document.getElementById('autoplay_btn');
  // set all cells' stati to dead
  this.mapAllCells(function(cell) {
    cell.setAttribute("data-status", "dead");
    cell.className = "dead";
  });

  // if on auto-play, clear and set the Pause btn back to Autoplay when Clear btn is clicked
  window.clearInterval(this.autoPlayInterval);
  self.autoPlayInterval = false;
  if (autoplay_btn !== null) {
    autoplay_btn.className = "btn btn-primary";
    autoplay_btn.innerHTML = "Auto-Play";
  };
};

// instantiate a 15X15 board of Game of Life
var gol = new GameOfLife(15,15);
gol.createAndShowBoard();