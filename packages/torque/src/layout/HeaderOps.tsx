import React, { Component } from "react";
import { OnChainIndicator } from "../components/OnChainIndicator";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderMenu, IHeaderMenuProps } from "./HeaderMenu";
import { HeaderMenuToggle } from "./HeaderMenuToggle";

export interface IHeaderOpsProps {
  doNetworkConnect: () => void;
  isLoading: boolean;
  // isMobileMedia: boolean;
}

interface IHeaderOpsState {
  isMenuOpen: boolean;
}

export class HeaderOps extends Component<IHeaderOpsProps, IHeaderOpsState> {
  
  constructor(props: IHeaderOpsProps) {
    super(props);

    this.state = {
      isMenuOpen: false
    };
  }

  /*public componentDidMount(): void {
  }*/

  /*public componentWillUnmount(): void {
  }*/

  public render() {
    // return !this.props.isMobileMedia ? this.renderDesktop() : this.renderMobile();
    return this.renderDesktop();
  }

  private renderDesktop = () => {
    
    const menu: IHeaderMenuProps = {
      items: [
        { id: 1, title: "Borrow", link: "/borrow/n", external: false },
        { id: 2, title: "Dashboard", link: "/dashboard/n", external: false },
      ]
    };
    
    return (
      <header className="header">
        <div className="header__row">
          <div className="header__left">
            <HeaderLogo />
          </div>
          <div className="header__center">
            <HeaderMenu items={menu.items} />
          </div>
          <div className="header__right">
            {/*<OnChainIndicator doNetworkConnect={this.props.doNetworkConnect} />*/}
          </div>
        </div>
      </header>
    );
  };

  /*private renderMobile = () => {
    
    const menu: IHeaderMenuProps = {
      items: [
        { id: 0, title: "Home", link: "/", external: false },
        { id: 1, title: "Lend", link: "/lend", external: false },
        { id: 3, title: "Faq", link: "https://bzx.network/faq-fulcrum.html", external: true }
      ]
    };
    
    return (
      <header className="header">
        <div className="header__row">
          <div className="header__left">
            <HeaderLogo />
          </div>
          <div className="header__right">
            <HeaderMenuToggle isMenuOpen={this.state.isMenuOpen} onMenuToggle={this.onMenuToggle} />
          </div>
        </div>
        {this.state.isMenuOpen ? (
          <div className="header__popup-container">
            <HeaderMenu items={menu.items} />
            <OnChainIndicator doNetworkConnect={this.props.doNetworkConnect} />
          </div>
        ) : null}
      </header>
    );
  };

  private onMenuToggle = (value: boolean) => {
    this.setState({ ...this.state, isMenuOpen: value });
  };*/
}