import { useEffect, useReducer } from "react"
import Main from "./Main"
import Header from "./Header"
import Loader from "./Loader"
import Error from "./Error"
import StartScreen from "./StartScreen"
import Question from "./Question"
import NextButton from "./NextButton"
import Progress from "./Progress"
import FinishScreen from "./FinishScreen"
import Footer from "./Footer"
import Timer from "./Timer"

const initialState = {
  questions: [],
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  heighScore: 0,
  secondsRemaining: null
}


function reducer(state, action) {
  switch (action.type) {
    case "dataRecived":
      return {
        ...state, questions: action.payload,
        status: "ready"
      }
    case "dataFailed":
      return {
        ...state,
        status: "fail"
      }
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * 30
      }
    case "newAnswer":
      const question = state.questions.at(state.index)
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ? state.points + question.points : state.points
      }
    case "nextQuestion":
      return {
        ...state, index: state.index + 1, answer: null
      }
    case "finish":
      return {
        ...state, status: "finished", heighscore: state.points > state.heighscore ? state.points : state.heighscore
      }
    case "reset":
      return {
        ...initialState, questions: state.questions, status: "ready"
      }
    case "tick":
      return {
        ...state, secondsRemaining: state.secondsRemaining - 1, status: state.secondsRemaining === 0 ? "finished" : state.status
      }


    default: throw new Error('uknown!')
  }

}

export default function App() {
  const [{ status, questions, index, answer, points, heighscore, secondsRemaining }, dispatch] = useReducer(reducer, initialState)
  const numQuestions = questions.length
  // console.log(questions)
  const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0)


  useEffect(() => {
    fetch('http://localhost:8000/questions').then(res => res.json()).then(data => dispatch({ type: "dataRecived", payload: data })).catch(err => dispatch({ type: "dataFailed" }))
  }, [])
  return <div className="app">
    <Header />
    <Main>
      {status === "loading" && <Loader />}
      {status === "fail" && <Error />}
      {status === "ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
      {status === "active" &&
        <>
          <Progress numQuestions={numQuestions} index={index} points={points} maxPossiblePoints={maxPossiblePoints} answer={answer} />
          <Question questions={questions[index]}
            dispatch={dispatch} answer={answer} />
          <Footer>
            <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
            <NextButton dispatch={dispatch} answer={answer} index={index} numQuestions={numQuestions} />
          </Footer>
        </>
      }
      {status === "finished" && <FinishScreen points={points} maxPossiblePoints={maxPossiblePoints} heighScore={heighscore} dispatch={dispatch} />}
    </Main>
  </div >
}