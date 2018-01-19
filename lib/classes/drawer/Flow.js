const Overlap = require("overlap");
const Couleurs = require("couleurs");
const Box = require("cli-box");
const cliSize = require("cli-size");
const Table = require('cli-table2');
const PolicyHelper = require('../core/helpers/Policy');

class Flow {
	static draw(type, flows) {
		
		let flow = new Flow(type, flows);
		return flow.draw();
	}

	constructor(type, flows) {
		// Received
		this._type = type;
		this._flows = flows;
		this._buffer = "";
		// Calculated
		this._screen = cliSize();
		this._minBoxesByCanvas = 6;
		this._canvasSize = this._screen.columns;
		this._canvasPadding = 2;
		this._boxPadding = 2;
		this._boxSpacing = 2;
		
		
		this._minBoxSize = 5;
		this._arrowSize = 5;
		this._arrowBox = Box({w: this._arrowSize, h: 1, marks: {nw: " ", n:  " ", ne: " ", e:  " ", se: " ", s:  " ", sw: " ", w:  " ", b: " "}}, Couleurs(((this._type == 'request') ? "->" : "<-"), [255, 20, 20])) 
		this._beginBoxPosition = (this._type == 'request') ? this._canvasPadding : this._screen.columns - this._canvasPadding + 1;
		
		this.autoSelectTypeDraw();
	}

	autoSelectTypeDraw() {
		this.canShowNormal((typeDraw) => {
			if(typeDraw == 'normalWithArrows') {
				this.drawNormal(true);
			} else if(typeDraw == 'normalWithoutArrows') {
				this.drawNormal(false);
			} else if(typeDraw == 'onlyNumberWithArrows'){
				this.drawOnlyNumbers(true);
			} else if(typeDraw == 'onlyNumberWithoutArrows'){
				this.drawOnlyNumbers(false);
			}

			if(typeDraw == "onlyNumberWithArrows" || typeDraw == "onlyNumberWithoutArrows" || typeDraw == "onlyTable") {
				this.showTable();
			}
		})
	}

	showTable() {
		var table = new Table({
    	    head: ["#", "Policies in " + this._type]
    	  , colWidths: [5, this._screen.columns - 10]
    	});
		for(let index in this._flows) {
			let policy = new PolicyHelper(this._flows[index].name);

			table.push([Number(index) + 1, `${this._flows[index].name} - ${global.chalk.yellow(policy.type)}`]);
			if(this._flows[index].condition != '') table.push(['', global.chalk.blue(this._flows[index].condition)]);
		}

    	this._buffer += "\n\n" + table.toString();
	}

	canShowNormal(callback) {
		let eachTotal = this._flows.map((item) => item.length + (this._boxPadding * 2));
		let totalSizeWithoutArrows = this._canvasSize - 1;
		let totalSizeWithArrows = this._canvasSize - 1;
		if(eachTotal.length > 0) {
			totalSizeWithoutArrows = eachTotal.reduce((valorAnterior, valorActual, indice, vector) => valorAnterior + valorActual) + (this._boxSpacing * (this._flows.length - 1)) + (this._canvasPadding * 2);
			totalSizeWithArrows = totalSizeWithoutArrows + (this._arrowSize * (this._flows.length - 1));
		}
		

		let eachTotalOnlyNumber = this._flows.map((item) => this._flows.indexOf(item).toString().length + (this._boxPadding * 2));
		let totalSizeWithoutArrowsOnlyNumbers = this._canvasSize - 1;
		let totalSizeWithArrowsOnlyNumbers = this._canvasSize - 1;		
		if (eachTotalOnlyNumber.length > 0) {
			totalSizeWithoutArrowsOnlyNumbers = eachTotalOnlyNumber.reduce((valorAnterior, valorActual, indice, vector) => valorAnterior + valorActual) + (this._boxSpacing * (this._flows.length - 1)) + (this._canvasPadding * 2);
			totalSizeWithArrowsOnlyNumbers = totalSizeWithoutArrowsOnlyNumbers + (this._arrowSize * (this._flows.length - 1));		
		}

		if(global.prefs.graph === undefined || global.prefs.graph.withNames === undefined) {
			global.prefs.graph = {};
			global.prefs.graph.withNames = true;
		}

		if((this._canvasSize - totalSizeWithArrows) > 0 && global.prefs.graph.withNames) {
			callback("normalWithArrows");
		} else if((this._canvasSize - totalSizeWithoutArrows) > 0 && global.prefs.graph.withNames) {
			callback("normalWithoutArrows");
		} else if((this._canvasSize - totalSizeWithArrowsOnlyNumbers) > 0) {
			callback("onlyNumberWithArrows");
		} else if((this._canvasSize - totalSizeWithoutArrowsOnlyNumbers) > 0) {
			callback("onlyNumberWithoutArrows")
		} else {
			callback("onlyTable");
		}
	}

	drawNormal(addArrow = false) {

		this.getCanvas();

		let totalPosition = this._beginBoxPosition;
		for(let index in this._flows) {
			if(this._type == 'response') {
				if(addArrow && index > 0) {
					totalPosition = totalPosition - this._arrowSize;
					this.addArrow(totalPosition);
					
				}
				totalPosition = totalPosition - (this._flows[index].name.length + (this._boxPadding * 2)) - this._boxSpacing;
			}
			this.addPolicy(index, false, totalPosition);
			if(this._type == 'request') {
				totalPosition = totalPosition + (this._flows[index].name.length + (this._boxPadding * 2)) + this._boxSpacing;
				if(addArrow && index < (this._flows.length - 1)) {
					this.addArrow(totalPosition);
					totalPosition = totalPosition + this._arrowSize;
				}
			}
		}
	}

	drawOnlyNumbers(addArrow) {
		this.getCanvas();

		let totalPosition = this._beginBoxPosition;
		for(let index in this._flows) {
			if(this._type == 'response') {
				if(addArrow && index > 0) {
					totalPosition = totalPosition - this._arrowSize;
					this.addArrow(totalPosition);
					
				}
				totalPosition = totalPosition - (index.length + (this._boxPadding * 2)) - this._boxSpacing;
			}
			this.addPolicy(index, true, totalPosition);
			if(this._type == 'request') {
				totalPosition = totalPosition + (index.length + (this._boxPadding * 2)) + this._boxSpacing;
				if(addArrow && index < (this._flows.length - 1)) {
					this.addArrow(totalPosition);
					totalPosition = totalPosition + this._arrowSize;
				}
			}
		}
	}

	addPolicy(index, onlyNumber, position) {
		if(onlyNumber) {
			let textColor = (this._flows[index].condition == '') ? "#c0392b" : "#c0FF00";
			let box = Box( this._minBoxSize + "x1", Couleurs(Number(index) + 1, textColor))
			this._buffer = Overlap({
				    who: this._buffer
				  , with: box
				  , where: {
				        x: position
				      , y: 2
				    }
				});
		} else {
			let width = this._flows[index].name.length + (this._boxPadding * 2);
			let textColor = (this._flows[index].condition == '') ? "#c0392b" : "#c0FF00";
			let box = Box( width + "x1", Couleurs(this._flows[index].name, textColor))
			this._buffer = Overlap({
				    who: this._buffer
				  , with: box
				  , where: {
				        x: position
				      , y: 2
				    }
				});
		}
	}

	addArrow(position) {
		this._buffer = Overlap({
			    who: this._buffer
			  , with: this._arrowBox
			  , where: {
			        x: position
			      , y: 2
			    }
			});
	}

	getCanvas() {
		if(this._type == "request") {
			this._buffer = Box(this._canvasSize + "x4", {text: Couleurs("   Request", [142, 68, 173]) + " " + Couleurs("->", [255, 20, 20]) , vAlign: "top", hAlign: "left"});
		} else {
			this._buffer = Box(this._canvasSize + "x4", {text: Couleurs("<-", [255, 20, 20]) +" "+ Couleurs("Response   ", [142, 68, 173]) , vAlign: "top", hAlign: "right"});
		}
	}

	draw() {
		return this._buffer;
	}
}

module.exports = Flow;