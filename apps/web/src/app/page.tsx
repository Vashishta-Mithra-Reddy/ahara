import { Warp } from '@paper-design/shaders-react';

export default function Home() {
	return (
		<div className="w-full mx-auto px-4 py-2">
			<section className="rounded-lg px-4 py-8 h-full w-full relative flex items-center justify-center">
				<h1 className='text-5xl font-outfit font-medium text-center text-white z-50'>Welcome to āhāra</h1>
				<Warp
				colors={["#ff0000", "#ff2600", "#f9ff85"]}
				proportion={0.5}
				softness={1}
				distortion={0.09}
				swirl={0.9}
				swirlIterations={6}
				shape="checks"
				shapeScale={0.25}
				speed={3}
				scale={2.5}
				rotation={1.35}
				className='h-full w-full rounded-2xl absolute top-0 left-0'
				/>
			</section>
		</div>
	);
}
