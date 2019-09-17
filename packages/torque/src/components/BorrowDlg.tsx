import React, { Component } from "react";
import ReactModal from "react-modal";
import { Asset } from "../domain/Asset";
import { BorrowRequest } from "../domain/BorrowRequest";
import { WalletType } from "../domain/WalletType";
import { BorrowForm } from "./BorrowForm";
import { DialogHeader } from "./DialogHeader";

interface IBorrowDlgState {
  isOpen: boolean;
  borrowAsset: Asset;
  walletType: WalletType;

  executorParams: { resolve: (value?: BorrowRequest) => void; reject: (reason?: any) => void } | null;
}

export class BorrowDlg extends Component<any, IBorrowDlgState> {
  public constructor(props: any, context?: any) {
    super(props, context);

    this.state = { isOpen: false, borrowAsset: Asset.UNKNOWN, walletType: WalletType.Unknown, executorParams: null };
  }

  public render() {
    return (
      <ReactModal
        isOpen={this.state.isOpen}
        className="modal-content-div"
        overlayClassName="modal-overlay-div"
        onRequestClose={this.onFormDecline}
        shouldCloseOnOverlayClick={false}
      >
        <DialogHeader title={`Borrow how much ${this.state.borrowAsset}?`} onDecline={this.onFormDecline} />
        <BorrowForm borrowAsset={this.state.borrowAsset} walletType={this.state.walletType} onSubmit={this.onFormSubmit} onDecline={this.onFormDecline} />
      </ReactModal>
    );
  }

  public getValue = async (walletType: WalletType, borrowAsset: Asset): Promise<BorrowRequest> => {
    if (this.state.isOpen) {
      return new Promise<BorrowRequest>((resolve, reject) => reject());
    }

    return new Promise<BorrowRequest>((resolve, reject) => {
      this.setState({
        ...this.state,
        isOpen: true,
        executorParams: { resolve: resolve, reject: reject },
        walletType: walletType,
        borrowAsset: borrowAsset
      });
    });
  };

  public hide = () => {
    this.setState({ ...this.state, isOpen: false, executorParams: null });
  };

  private onFormSubmit = (value: BorrowRequest) => {
    if (this.state.executorParams) {
      this.state.executorParams.resolve(value);
    }
  };

  private onFormDecline = () => {
    if (this.state.executorParams) {
      this.state.executorParams.reject();
    }
  };
}
