export class Note {
  constructor(title, color, complete) {
    this._title = title;
    this._color = color || '#ffffff';
    this._complete = complete || false;
  }
  
  get title() {
    return this._title;
  }
  
  get color() {
    return this._color;
  }
  
  get complete() {
    return this._complete;
  }
  
  set title(title) {
    this._title = title;
  }
  
  set color(color) {
    this._color = color;
  }
  
  set complete(complete) {
    this._complete = complete;
  }
  
  toString() {
    return `Title: ${this._title}, Complete: ${this._complete} Color: ${this._color}`;
  }
}

export class ComplexNote extends Note {
  constructor(title, color, complete, description) {
    super(title, color, complete);
    this._description = description || '';
  }
  
  get description() {
    return this._description;
  }
  
  set description(description) {
    this._description = description;
  }
  
  toString() {
    return `${super.toString()}, Description: ${this._description}`;
  }
}