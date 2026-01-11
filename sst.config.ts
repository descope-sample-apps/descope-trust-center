/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "descope-trust-center",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const email = new sst.aws.Email("TrustCenterEmail", {
      sender: "descope.com",
      dmarc: "v=DMARC1; p=quarantine; adkim=s; aspf=s;",
    });

    const nextjs = new sst.aws.Nextjs("TrustCenterWeb", {
      path: "apps/nextjs",
      link: [email],
      environment: {
        TRUST_CENTER_FROM_EMAIL: `noreply@${email.sender}`,
        TRUST_CENTER_NOTIFICATION_EMAIL: "security@descope.com",
      },
    });

    return {
      url: nextjs.url,
      sender: email.sender,
    };
  },
});
