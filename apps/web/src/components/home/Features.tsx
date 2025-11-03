"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
	ChevronLeft,
	ChevronRight,
	BarChart3,
	Calendar,
	Brain,
	Shield,
} from "lucide-react";
import { Button } from "../ui/button";

const features = [
	{
		id: 1,
		title: "Smart Food Tracking",
		description:
			"Effortlessly log your meals with our intelligent food database. Track nutrients, portions, and timing to understand your eating patterns.",
		icon: Calendar,
		image: "/api/placeholder/600/400",
		benefits: [
			"Comprehensive food database",
			"Quick meal logging",
			"Nutritional insights",
			"Portion tracking",
		],
	},
	{
		id: 2,
		title: "Symptom Correlation",
		description:
			"Discover connections between what you eat and how you feel. Our AI analyzes patterns to help you identify trigger foods and beneficial nutrients.",
		icon: Brain,
		image: "/api/placeholder/600/400",
		benefits: [
			"Pattern recognition",
			"Trigger identification",
			"Mood tracking",
			"Health correlations",
		],
	},
	{
		id: 3,
		title: "Personalized Insights",
		description:
			"Get tailored recommendations based on your unique data. Understand your body's responses and optimize your diet for better health outcomes.",
		icon: BarChart3,
		image: "/api/placeholder/600/400",
		benefits: [
			"Custom recommendations",
			"Data-driven insights",
			"Health optimization",
			"Progress tracking",
		],
	},
	{
		id: 4,
		title: "Privacy First",
		description:
			"Your health data is encrypted and secure. We prioritize your privacy while providing powerful insights to improve your well-being.",
		icon: Shield,
		image: "/api/placeholder/600/400",
		benefits: [
			"End-to-end encryption",
			"HIPAA compliant",
			"Data ownership",
			"Secure storage",
		],
	},
];

export default function Features() {
	const [currentFeature, setCurrentFeature] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentFeature((prev) => (prev + 1) % features.length);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	const nextFeature = () => {
		setCurrentFeature((prev) => (prev + 1) % features.length);
	};

	const prevFeature = () => {
		setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
	};

	const currentFeatureData = features[currentFeature];

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
						Powerful <span className="text-glow">Features</span> for Better
						Health
					</h2>
					<p className="text-muted-foreground text-lg max-w-3xl mx-auto">
						Discover how our comprehensive platform helps you understand your
						body's unique responses to food and lifestyle choices.
					</p>
				</motion.div>

				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Image Slideshow */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="relative"
					>
						<div className="relative overflow-hidden rounded-2xl bg-card border shadow-lg">
							<div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
								<div className="text-center p-8">
									<currentFeatureData.icon className="w-24 h-24 text-primary mx-auto mb-4" />
									<h3 className="text-2xl font-semibold text-foreground mb-2">
										{currentFeatureData.title}
									</h3>
									<p className="text-muted-foreground">
										Interactive demo coming soon
									</p>
								</div>
							</div>

							{/* Navigation Controls */}
							<div className="absolute inset-y-0 left-4 flex items-center">
								<Button
									variant="ghost"
									size="icon"
									onClick={prevFeature}
									className="bg-background/80 hover:bg-background/90 backdrop-blur-sm"
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>
							</div>
							<div className="absolute inset-y-0 right-4 flex items-center">
								<Button
									variant="ghost"
									size="icon"
									onClick={nextFeature}
									className="bg-background/80 hover:bg-background/90 backdrop-blur-sm"
								>
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>

							{/* Slide Indicators */}
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
								{features.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentFeature(index)}
										className={`w-2 h-2 rounded-full transition-all duration-300 ${
											index === currentFeature
												? "bg-primary w-8"
												: "bg-primary/30 hover:bg-primary/50"
										}`}
									/>
								))}
							</div>
						</div>
					</motion.div>

					{/* Feature Details */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="space-y-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
								<currentFeatureData.icon className="w-6 h-6 text-primary" />
							</div>
							<h3 className="font-outfit text-3xl font-semibold text-foreground">
								{currentFeatureData.title}
							</h3>
						</div>

						<p className="text-muted-foreground text-lg leading-relaxed">
							{currentFeatureData.description}
						</p>

						<div className="space-y-3">
							<h4 className="font-semibold text-foreground">Key Benefits:</h4>
							<ul className="space-y-2">
								{currentFeatureData.benefits.map((benefit, index) => (
									<motion.li
										key={benefit}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: index * 0.1 }}
										className="flex items-center gap-3 text-muted-foreground"
									>
										<div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
										{benefit}
									</motion.li>
								))}
							</ul>
						</div>

						{/* Feature Navigation */}
						<div className="flex gap-2 pt-4">
							{features.map((feature, index) => (
								<button
									key={feature.id}
									onClick={() => setCurrentFeature(index)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
										index === currentFeature
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground hover:bg-muted/80"
									}`}
								>
									{feature.title}
								</button>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
