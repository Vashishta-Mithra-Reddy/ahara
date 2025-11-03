import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// export const authClient = createAuthClient({
//     plugins: [inferAdditionalFields({
//       user: {
//         onboardingCompleted: {
//           type: 'boolean'
//         },
//         onboardingCompletedAt: {
//           type: 'date'
//         }
//       }
//     })
//   ]
// });

import type { auth } from "@ahara/auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});
