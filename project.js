import { Note, ComplexNote } from "./note.js";

export class Project {
  constructor(name, description, notes) {
    this._name = name;
    this._description = description;
    this._notes = notes;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get description() {
    return this._description;
  }

  set description(description) {
    this._description = description;
  }

  get notes() {
    return this._notes;
  }

  set notes(notes) {
    this._notes = notes;
  }

  addNote(note) {
    this._notes.push(note);
  }

  removeNote(note) {
    this._notes = this._notes.filter(n => n !== note);
  }

  toString() {
    return `Project: ${this._name}, Description: ${this._description}, Notes: ${this._notes.length}`;
  }
}