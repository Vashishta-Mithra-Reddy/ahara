"use client";

import { motion } from "framer-motion";
import { Heart, Zap, Users, Award, TrendingUp, Clock } from "lucide-react";

const benefits = [
	{
		icon: Heart,
		title: "Improve Your Health",
		description:
			"Identify food sensitivities, optimize nutrition, and feel better every day.",
		stats: "92% report improved well-being",
	},
	{
		icon: Zap,
		title: "Boost Energy Levels",
		description:
			"Discover which foods give you sustained energy and which ones drain you.",
		stats: "Average 40% energy increase",
	},
	{
		icon: TrendingUp,
		title: "Track Progress",
		description:
			"Visualize your health journey with detailed analytics and insights.",
		stats: "See results in 2-3 weeks",
	},
	{
		icon: Clock,
		title: "Save Time",
		description:
			"Quick logging and automated insights save hours of manual tracking.",
		stats: "5 minutes daily logging",
	},
	{
		icon: Users,
		title: "Join Community",
		description:
			"Connect with others on similar health journeys and share experiences.",
		stats: "10,000+ active members",
	},
	{
		icon: Award,
		title: "Evidence-Based",
		description:
			"Built on scientific research and validated by healthcare professionals.",
		stats: "Clinically validated approach",
	},
];

export default function Benefits() {
	return (
		<section className="py-20 px-4">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="font-outfit text-4xl md:text-5xl font-semibold text-foreground mb-4">
						Transform Your <span className="text-glow">Health Journey</span>
					</h2>
					<p className="text-muted-foreground text-lg max-w-3xl mx-auto">
						Join thousands of users who have discovered the power of
						personalized health tracking and achieved their wellness goals.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{benefits.map((benefit, index) => (
						<motion.div
							key={benefit.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							className="group"
						>
							<div className="bg-card border rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
								<div className="space-y-4">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
										<benefit.icon className="w-6 h-6 text-primary" />
									</div>

									<div>
										<h3 className="font-semibold text-xl text-foreground mb-2">
											{benefit.title}
										</h3>
										<p className="text-muted-foreground mb-4 leading-relaxed">
											{benefit.description}
										</p>
										<div className="inline-flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
											<TrendingUp className="w-3 h-3" />
											{benefit.stats}
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Social Proof Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mt-16 text-center"
				>
					<div className="bg-card border rounded-2xl p-8 max-w-4xl mx-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							<div>
								<div className="text-3xl font-bold text-primary mb-2">
									10,000+
								</div>
								<div className="text-muted-foreground">Active Users</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-primary mb-2">92%</div>
								<div className="text-muted-foreground">Success Rate</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-primary mb-2">4.8★</div>
								<div className="text-muted-foreground">User Rating</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
