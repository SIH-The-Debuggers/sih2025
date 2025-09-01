import { Module } from "@nestjs/common";
import { DtidController } from "./dtid.controller";
import { DtidService } from "./dtid.service";
import { BlockchainService } from "./blockchain.service";

@Module({
  controllers: [DtidController],
  providers: [DtidService, BlockchainService],
  exports: [DtidService],
})
export class DtidModule {}
