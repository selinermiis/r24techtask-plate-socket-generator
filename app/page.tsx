import CanvasContainer from './components/CanvasContainer';
import ControllerContainer from './components/ControllerContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white p-4">
        <h1 className="text-3xl font-semibold">R24 Technical Task</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:grid lg:grid-cols-[3fr_1.25fr] gap-4 h-[calc(100vh-5rem)] max-w-full mx-auto p-4 md:p-6 box-border w-full">
        <CanvasContainer />
        <ControllerContainer />
      </main>
    </div>
  );
}
