import Benefits from "@/components/home/Benefits";
import CallToAction from "@/components/home/CallToAction";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import SetupProcess from "@/components/home/SetupProcess";

export default function Home() {
	return (
		<div className="mx-auto w-full">
			<div className="px-4 py-4">
			<Hero />
			</div>

			{/* <Features /> */}
			
			<SetupProcess />
			{/* <Benefits /> */}
			<CallToAction />
		</div>
	);
}
