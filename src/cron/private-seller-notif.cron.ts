import { ServiceFactorySingleton } from "@/factory/service.factory";
import { CronJob } from "cron";

new CronJob(
  "0 * * * *",
  function () {
    ServiceFactorySingleton.getInstance()
      .getPrivateSellerPurchaseStatsService()
      .notifyForSellersWithAnnualThresholdCrossed();
  }, // onTick
  null, // onComplete
  true, // start
  "UTC" // timeZone
);
