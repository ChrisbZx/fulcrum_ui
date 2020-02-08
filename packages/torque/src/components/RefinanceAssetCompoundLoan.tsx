import React, { Component } from "react";
import { Asset } from "../domain/Asset";
import { IRefinanceLoan } from "../domain/IRefinanceData";
import { WalletType } from "../domain/WalletType";
import { TorqueProviderEvents } from "../services/events/TorqueProviderEvents";
import { TorqueProvider } from "../services/TorqueProvider";
import { RefinanceAssetCompoundLoanItem } from "./RefinanceAssetCompoundLoanItem";

export interface IRefinanceAssetCompoundLoanProps {
  walletType: WalletType

  onSelectAsset?: (asset: Asset) => void;
}

interface IRefinanceCompoundSelectorItemState {
  asset: Asset,
  refinanceCompoundData: IRefinanceLoan[];
}

export class RefinanceAssetCompoundLoan extends Component<IRefinanceAssetCompoundLoanProps, IRefinanceCompoundSelectorItemState> {
  constructor(props: IRefinanceAssetCompoundLoanProps) {
    super(props);

    this.state = {
      asset: Asset.DAI,
      refinanceCompoundData: []
    };
    // console.log("this.state=  "+this.state)
    TorqueProvider.Instance.eventEmitter.on(TorqueProviderEvents.ProviderAvailable, this.onProviderAvailable);

  }

  private onProviderAvailable = () => {
    this.derivedUpdate();
  };

  public componentDidMount(): void {
    this.derivedUpdate();
  }

  private derivedUpdate = async () => {
    // const refinanceCompoundData = await TorqueProvider.Instance.checkSoloMargin();
    const loans = await TorqueProvider.Instance.getCompoundLoans();
    this.setState({ ...this.state, refinanceCompoundData: loans });
  };

  public render() {
    const refinanceCompound = this.state.refinanceCompoundData;
    let items;
    if (this.props.walletType === WalletType.Web3) {

      items = refinanceCompound.map((e, index) => {
        return (
          <RefinanceAssetCompoundLoanItem key={index} {...e}/>
        );
      });

    } else {
      items = refinanceCompound.map((e, index) => {
        return (
          <RefinanceAssetCompoundLoanItem key={index} {...e}/>
        );
      });

    }
    return <div className="refinance-asset-selector">{items}</div>;
  }
}
