import React, {useState, createRef, useEffect} from "react";
import axios from "axios";
import "./style.css";
import "./inter/inter.css";

const {exec} = window.require("child_process");
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();

var inputValue;

export default () => {
    const [value, setValue] = useState("");
    const [results, setResults] = useState([]);
    const [answer, setAnswer] = useState();
    const [selection, setSelection] = useState(0);
    const inputElem = createRef();

    //Form Input
    const formInput = val => {
        setValue(val);
        inputValue = val;
        //TODO: Abort all axios requests HERE
        setResults([]);
        setAnswer();
        if (!val.trim()) return;
        if (val.startsWith(">")) return;
        
        axios.post("http://localhost:8081/pulsar/api/input", {
            input: val
        }, {
            headers: {
                authorization: "byr4VC8WtiWCimjfwN2oha7d%ji$Fh*YjH$NZazpK*de&yWc2GS$$sJGgt$B^xhyESa6nqYzvcwG$UAx&L3LaT8XubwNAVtF@XFaXD@Td^d2qQCx7Lz%za!&^PNqNNgB"
            }
        }).then((res) => {
            if (val !== inputValue) return;
            setResults(res.data.results);
            setAnswer(res.data.answer);
        }).catch(() => {});
    };

    //Form Submit
    const formSubmit = e => {
        e.preventDefault();
    
        if (value) {
            if (value.startsWith(">")) {
                const command = value.replace(">", "");
                if (!command.length);
                exec(command);
            } else {
                const result = results[selection];
                if (result) doResult(result);
            }
        }
    
        win.close();
    };

    //Key Press
    document.onkeydown = e => {
        if (e.key === "Escape") {
            win.close();
        } else if (e.key === "ArrowUp") {
            if (selection <= 0) {
                setSelection(results.length - 1);
            } else {
                setSelection(selection - 1);
            }
        } else if (e.key === "ArrowDown") {
            if (selection >= results.length - 1) {
                setSelection(0);
            } else {
                setSelection(selection + 1);
            }
        }
    };

    //Do Result
    const doResult = result => {
        if (result.url) {
            electron.shell.openExternal(result.url);
        }
    };

    useEffect(() => {
        //Focus Input
        inputElem.current.focus();
    }, []);

    useEffect(() => {
        //Change Window Height
        const h = document.querySelector("#root").getBoundingClientRect().height;
        const w = win.getSize()[0];
        win.setMinimumSize(w, h);
        win.setSize(w, h);
    });

    return (
        <>
            <form onSubmit={formSubmit}>
                <input
                    ref={inputElem}
                    className={value.startsWith(">") ? "terminal" : ""}
                    onChange={e => formInput(e.target.value.trim())}
                    placeholder="What's up?"
                />
            </form>
            {value.startsWith(">") ? (
                <p className="banner">Danger! You are running a terminal command. This could damage your computer. Make sure you know what you're doing!</p>
            ) : <></>}
            {answer ? (
                <div className="answer">
                    <p>{answer}</p>
                </div>
            ) : <></>}
            {results.map((result, i) => {
                return (
                    <div
                        className={`resultItem ${selection === i ? "selected" : ""}`}
                        key={i}
                        onMouseOver={() => {
                            setSelection(i);
                        }}
                        onClick={() => {
                            doResult(result);
                            win.close();
                        }}
                    >
                        <p>{result.text}</p>
                    </div>
                );
            })}
        </>
    );
};