import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Returns { plan, isEnterprise, isPro, isStarter, isLoading }
 * plan: "enterprise" | "pro" | "starter" | null
 */
export function useSubscription() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.UserSubscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  const rawPlan = subscription?.plan_name?.toLowerCase() || null;

  // Normalise plan name — handle variants like "enterprise_plan", "pro_plan", etc.
  const plan = rawPlan?.includes("enterprise") ? "enterprise"
    : rawPlan?.includes("pro") ? "pro"
    : rawPlan?.includes("starter") ? "starter"
    : rawPlan;

  // Role-based override: enterprise_admin / enterprise_site_owner always have enterprise access
  const roleBasedEnterprise = user?.role === "enterprise_admin" || user?.role === "enterprise_site_owner";

  const isEnterprise = roleBasedEnterprise || plan === "enterprise";
  const isPro = isEnterprise || plan === "pro";
  const isStarter = !isEnterprise && !isPro;

  return {
    plan,
    isEnterprise,
    isPro,
    isStarter,
    isLoading: userLoading || subLoading,
    user,
    subscription,
  };
}