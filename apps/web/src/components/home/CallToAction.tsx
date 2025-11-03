"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AuthButton from "../auth/AuthButton";

export default function CallToAction() {
	return (
		<section className="py-8">
			<div className="mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="relative"
				>
					<div className="rounded-2xl p-8 md:p-12 text-center overflow-hidden">
						<div className="relative z-10">
							<motion.h2
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className="font-outfit text-3xl md:text-4xl font-semibold text-foreground mb-4"
							>
								Ready to Discover What <span className="text-glow">Works</span>{" "}
								for Your Body?
							</motion.h2>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
							>
								Start tracking today and see results in weeks, not months.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.5 }}
								className="flex flex-col gap-4 justify-center items-center"
							>
								<AuthButton className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary/90"/>

								{/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
									<ArrowRight className="w-4 h-4" />
									Free to start • No credit card required
								</div> */}
								
							</motion.div>

							{/* <motion.div
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.6 }}
								className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground"
							>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full" />
									HIPAA Compliant
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full" />
									Secure & Private
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-green-500 rounded-full" />
									Evidence-Based
								</div>
							</motion.div> */}
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
