import { BigNumber } from "@0x/utils";
import React, { Component } from "react";
import { Asset } from "../domain/Asset";
import { AssetDetails } from "../domain/AssetDetails";
import { AssetsDictionary } from "../domain/AssetsDictionary";
import { LendRequest } from "../domain/LendRequest";
import { LendType } from "../domain/LendType";
import { FulcrumProviderEvents } from "../services/events/FulcrumProviderEvents";
import { LendTransactionMinedEvent } from "../services/events/LendTransactionMinedEvent";
import { ProviderChangedEvent } from "../services/events/ProviderChangedEvent";
import { FulcrumProvider } from "../services/FulcrumProvider";

export interface ILendTokenSelectorItemProps {
  asset: Asset;

  onLend: (request: LendRequest) => void;
}

interface ILendTokenSelectorItemState {
  assetDetails: AssetDetails | null;
  interestRate: BigNumber;
  profit: BigNumber | null;
  balanceOfUser: BigNumber;
}

export class LendTokenSelectorItem extends Component<ILendTokenSelectorItemProps, ILendTokenSelectorItemState> {
  constructor(props: ILendTokenSelectorItemProps) {
    super(props);

    const assetDetails = AssetsDictionary.assets.get(props.asset);
    const interestRate = new BigNumber(0);
    const profit = new BigNumber(0);
    const balanceOfUser = new BigNumber(0);

    this.state = { assetDetails: assetDetails || null, interestRate: interestRate, profit: profit, balanceOfUser: balanceOfUser };

    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.LendTransactionMined, this.onLendTransactionMined);
  }

  private async derivedUpdate() {
    const assetDetails = AssetsDictionary.assets.get(this.props.asset);
    const interestRate = await FulcrumProvider.Instance.getLendTokenInterestRate(this.props.asset);
    const profit = await FulcrumProvider.Instance.getLendProfit(this.props.asset);
    const balanceOfUser = await FulcrumProvider.Instance.getITokenAssetBalanceOfUser(this.props.asset);

    this.setState({ ...this.state, assetDetails: assetDetails || null, interestRate: interestRate, profit: profit, balanceOfUser: balanceOfUser });
  }

  private onProviderAvailable = async () => {
    await this.derivedUpdate();
  };

  private onProviderChanged = async (event: ProviderChangedEvent) => {
    await this.derivedUpdate();
  };

  private onLendTransactionMined = async (event: LendTransactionMinedEvent) => {
    if (event.asset === this.props.asset) {
      await this.derivedUpdate();
    }
  };

  public componentWillUnmount(): void {
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.LendTransactionMined, this.onLendTransactionMined);
  }

  public componentDidMount(): void {
    this.derivedUpdate();
  }

  public componentDidUpdate(
    prevProps: Readonly<ILendTokenSelectorItemProps>,
    prevState: Readonly<ILendTokenSelectorItemState>,
    snapshot?: any
  ): void {
    if (this.props.asset !== prevProps.asset) {
      this.derivedUpdate();
    }
  }

  public render() {
    if (!this.state.assetDetails) {
      return null;
    }

    const noProfitInfoImageCss = this.state.profit === null ? "token-selector-item__image--full-width" : "";

    return (
      <div className="token-selector-item">
        <div>
          <div className={`token-selector-item__image ${noProfitInfoImageCss}`}>
            <img src={this.state.assetDetails.logoSvg} alt={this.state.assetDetails.displayName} />
          </div>
          {this.state.profit !== null ? (
            <div className="token-selector-item__profit-container" style={{ float: `right` }}>
              <div className="token-selector-item__profit-title">Balance:</div>
              <div title={`$${this.state.balanceOfUser.toFixed(18)}`} className="token-selector-item__profit-value" style={{ paddingBottom: `0.5625rem` }}>{`$${this.state.balanceOfUser.toFixed(2)}`}</div>
              <div className="token-selector-item__profit-title">Profit:</div>
              <div title={`$${this.state.profit.toFixed(18)}`} className="token-selector-item__profit-value">{`$${this.state.profit.toFixed(4)}`}</div>
            </div>
          ) : null}
        </div>
        <div className="token-selector-item__description">
          <div className="token-selector-item__name">{this.state.assetDetails.displayName}</div>
          <div className="token-selector-item__interest-rate-container">
            <div className="token-selector-item__interest-rate-title">Interest rate:</div>
            <div title={`$${this.state.interestRate.toFixed(18)}%`} className="token-selector-item__interest-rate-value">{`${this.state.interestRate.toFixed(4)}%`}</div>
          </div>
        </div>
        {this.renderActions(this.state.balanceOfUser.eq(0))}
      </div>
    );
  }

  private renderActions = (isLendOnly: boolean) => {
    return isLendOnly ? (
      <div className="token-selector-item__actions">
        <button
          className="token-selector-item__lend-button token-selector-item__lend-button--size-full"
          onClick={this.onLendClick}
        >
          Lend
        </button>
      </div>
    ) : (
      <div className="token-selector-item__actions">
        <button
          className="token-selector-item__lend-button token-selector-item__lend-button--size-half"
          onClick={this.onLendClick}
        >
          Lend
        </button>
        <button className="token-selector-item__un-lend-button" onClick={this.onUnLendClick}>
          UnLend
        </button>
      </div>
    );
  };

  public onLendClick = () => {
    this.props.onLend(new LendRequest(LendType.LEND, this.props.asset, new BigNumber(0)));
  };

  public onUnLendClick = () => {
    this.props.onLend(new LendRequest(LendType.UNLEND, this.props.asset, new BigNumber(0)));
  };
}
