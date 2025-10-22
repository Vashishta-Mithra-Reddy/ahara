"use client";

import {Warp} from "@paper-design/shaders-react";
import {motion} from "framer-motion";
import UserMenu from "./user-menu";
export default function HomeScreen() {
    return (
        <motion.section 
        initial={{opacity: 0, y:20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className="rounded-lg px-4 py-8 h-3/5 w-full relative flex items-center justify-center">
			<div className="relative z-50 flex flex-col items-center justify-center gap-6">
            <motion.h1 
			initial={{opacity: 0, y: 40, filter: "blur(5px)"}}
			animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
			transition={{duration: 0.5, delay:0.4}}
			className='text-5xl font-outfit font-medium text-center text-white'>
			<span className='brightness-200 text-glow'>āhāra</span>: your food diary
			</motion.h1>
            <motion.div
            initial={{opacity: 0, y: 40, filter: "blur(5px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{duration: 0.5, delay:0.8}}
            >
            <UserMenu/>
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
				className='h-full w-full rounded-2xl absolute top-0 left-0'
				/>
		</motion.section>
    );
}