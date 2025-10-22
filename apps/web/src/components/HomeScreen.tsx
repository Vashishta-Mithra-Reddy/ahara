"use client";

import { Warp } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import AuthButton from "./AuthButton";
export default function HomeScreen() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="relative flex h-3/5 w-full items-center justify-center rounded-lg px-4 py-8"
		>
			<div className="relative z-50 flex flex-col items-center justify-center gap-6">
				<motion.h1
					initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="text-center font-medium font-outfit text-5xl text-white"
				>
					<span className="text-glow brightness-200">āhāra</span>: your food
					diary
				</motion.h1>
				<motion.div
					initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{ duration: 0.5, delay: 0.8 }}
				>
					<AuthButton />
				</motion.div>
			</div>

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
				className="absolute top-0 left-0 h-full w-full rounded-2xl"
			/>
		</motion.section>
	);
}
