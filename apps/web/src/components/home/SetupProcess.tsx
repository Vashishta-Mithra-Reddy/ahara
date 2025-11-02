"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
	{
		icon: CheckCircle,
		title: "Sign Up",
		description: "Create your account in seconds",
		duration: "30 seconds",
	},
	{
		icon: Target,
		title: "Set Goals",
		description: "Define what you want to track and achieve",
		duration: "2 minutes",
	},
	{
		icon: Clock,
		title: "Daily Logging",
		description: "Track your food, symptoms, and mood daily",
		duration: "5 minutes/day",
	},
	{
		icon: TrendingUp,
		title: "Get Insights",
		description: "Discover patterns and optimize your health",
		duration: "Ongoing",
	},
];

export default function SetupProcess() {
	const router = useRouter();
	return (
		<section className="py-16 px-4 border-y-2 border-dashed">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h2 className="font-outfit text-4xl font-semibold text-foreground mb-4">
						Get Started in <span className="underline decoration-wavy">Minutes</span>
					</h2>
					{/* <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
						Our streamlined setup process gets you tracking and discovering insights about your health in no time.
					</p> */}
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, index) => (
						<motion.div
							key={step.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							className="relative group"
							onClick={() => router.push("/login")}
						>
							<div className="bg-card border rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
								<div className="flex flex-col items-center text-center space-y-4">
									<div className="relative">
										<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
											<step.icon className="w-8 h-8 text-primary" />
										</div>
										<div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
											{index + 1}
										</div>
									</div>
									
									<div>
										<h3 className="font-semibold text-lg text-foreground mb-2">
											{step.title}
										</h3>
										<p className="text-muted-foreground text-sm mb-3">
											{step.description}
										</p>
										<div className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
											<Clock className="w-3 h-3" />
											{step.duration}
										</div>
									</div>
								</div>
							</div>
							
							{/* Connection line */}
							{index < steps.length - 1 && (
								<div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-0.5 bg-border transform -translate-y-1/2 z-10">
									{/* <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div> */}
								</div>
							)}
						</motion.div>
					))}
				</div>

				{/* <motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="text-center mt-12"
				>
					<p className="text-muted-foreground text-sm">
						Join thousands of users who have transformed their health journey with āhāra
					</p>
				</motion.div> */}
			</div>
		</section>
	);
}