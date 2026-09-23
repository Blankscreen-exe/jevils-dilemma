import { deck } from './game/deck'
import { useGame } from './hooks/useGame'
import { CardScreen } from './screens/CardScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { TitleScreen } from './screens/TitleScreen'

export default function App() {
  const game = useGame(deck)
  const { state } = game

  switch (state.phase) {
    case 'title':
      return <TitleScreen canResume={game.canResume} onStart={game.start} onResume={game.resume} />
    case 'playing':
      return <CardScreen state={state} onPick={game.pick} onNext={game.next} onQuit={game.quit} />
    case 'results':
      return (
        <ResultsScreen
          cards={state.cards}
          answers={state.answers}
          onPlayAgain={game.start}
          onTitle={game.quit}
        />
      )
  }
}
