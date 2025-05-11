import { ServiceFactorySingleton } from "@/factory/service.factory";
import logger from "@/utils/logger";
import { CronJob } from "cron";

new CronJob(
  "0 * * * *",
  function () {
    logger.info("Running seller notification cron");
    ServiceFactorySingleton.getInstance()
      .getSellerPurchaseStatsService()
      .notifyForSellersWithAnnualThresholdCrossed();
  }, // onTick
  null, // onComplete
  true, // start
  "UTC" // timeZone
);
