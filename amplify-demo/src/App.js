import React from "react";
import "./App.css";

import { Component } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import awsExports from "./aws-exports";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports);

class AddNote extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "" };
  }

  handleChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleClick = () => {
    this.props.addNote(this.state);
    this.setState({ name: "" });
  };

  render() {
    return (
      <div style={styles.form}>
        <input value={this.state.name} onChange={this.handleChange} placeholder="New Note" style={styles.input} />
        <button onClick={this.handleClick} style={styles.addButton}>
          Add Note
        </button>
      </div>
    );
  }
}

class NotesList extends Component {
  render() {
    return (
      <div>
        {this.props.notes
          .filter((note) => note)
          .map((note) => (
            <div key={note.id} style={styles.note}>
              <p>{note.name}</p>
              <button
                onClick={() => {
                  this.props.deleteNote(note);
                }}
                style={styles.deleteButton}
              >
                x
              </button>
            </div>
          ))}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { notes: [] };
  }

  async componentDidMount() {
    var result = await API.graphql(graphqlOperation(listTodos));
    this.setState({ notes: result.data.listTodos.items });
  }

  deleteNote = async (note) => {
    const id = {
      id: note.id,
    };
    await API.graphql(graphqlOperation(deleteTodo, { input: id }));
    this.setState({ notes: this.state.notes.filter((item) => item.id !== note.id) });
  };

  addNote = async (note) => {
    var result = await API.graphql(graphqlOperation(createTodo, { input: note }));
    this.state.notes.push(result.data.createTodo);
    this.setState({ notes: this.state.notes });
  };

  render() {
    return (
      <Authenticator>
        <div style={styles.container}>
          <h1>Notes App</h1>
          <AddNote addNote={this.addNote} />
          <NotesList notes={this.state.notes} deleteNote={this.deleteNote} />
        </div>
      </Authenticator>
    );
  }
}

export default App;

const styles = {
  container: { width: 480, margin: "0 auto", padding: 20 },
  form: { display: "flex", marginBottom: 15 },
  input: { flexGrow: 2, border: "none", backgroundColor: "#ddd", padding: 12, fontSize: 18 },
  addButton: { backgroundColor: "black", color: "white", outline: "none", padding: 12, fontSize: 18 },
  note: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, marginBottom: 15 },
  deleteButton: { fontSize: 18, fontWeight: "bold" },
};
