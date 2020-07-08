import { Web3ProviderEngine } from "@0x/subproviders";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { EventEmitter } from "events";

import Web3 from "web3";


import { IWeb3ProviderSettings } from "../domain/IWeb3ProviderSettings";
import constantAddress from "../config/constant.json";


import { AbstractConnector } from '@web3-react/abstract-connector';
import { ProviderTypeDictionary } from "../domain/ProviderTypeDictionary";
import { ProviderType } from "../domain/ProviderType";
import { Web3ConnectionFactory } from "../domain/Web3ConnectionFactory";
import { StackerProviderEvents } from "./events/StackerProviderEvents";
import { ContractsSource } from "./ContractsSource";
import { BigNumber } from "@0x/utils";
import { Asset } from "../domain/Asset";
import { AssetsDictionary } from "../domain/AssetsDictionary";

const web3: Web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let configAddress: any;
if (process.env.REACT_APP_ETH_NETWORK === "mainnet") {
    configAddress = constantAddress.mainnet;
} else {
    configAddress = constantAddress.kovan;
}


const getNetworkIdByString = (networkName: string | undefined) => {
    switch (networkName) {
        case 'mainnet':
            return 1;
        case 'ropsten':
            return 3;
        case 'rinkeby':
            return 4;
        case 'kovan':
            return 42;
        default:
            return 0;
    }
}
const networkName = process.env.REACT_APP_ETH_NETWORK;
const initialNetworkId = getNetworkIdByString(networkName);


export class StackerProvider {
    public static Instance: StackerProvider;

    public readonly gasLimit = "4000000";

    // gasBufferCoeff equal 110% gas reserve
    public readonly gasBufferCoeff = new BigNumber("1.03");

    public readonly eventEmitter: EventEmitter;
    public providerType: ProviderType = ProviderType.None;
    public providerEngine: Web3ProviderEngine | null = null;
    public web3Wrapper: Web3Wrapper | null = null;
    public web3ProviderSettings: IWeb3ProviderSettings;
    public contractsSource: ContractsSource | null = null;
    public accounts: string[] = [];
    public isLoading: boolean = false;
    public unsupportedNetwork: boolean = false;

    constructor() {
        // init
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(1000);

        //TasksQueue.Instance.on(TasksQueueEvents.Enqueued, this.onTaskEnqueued);

        // singleton
        if (!StackerProvider.Instance) {
            StackerProvider.Instance = this;
        }

        const storedProvider: any = StackerProvider.getLocalstorageItem('providerType');
        const providerType: ProviderType | null = storedProvider as ProviderType || null;

        this.web3ProviderSettings = StackerProvider.getWeb3ProviderSettings(initialNetworkId);
        if (!providerType || providerType === ProviderType.None) {

            // StackerProvider.Instance.isLoading = true;
            // setting up readonly provider
            this.web3ProviderSettings = StackerProvider.getWeb3ProviderSettings(initialNetworkId);
            Web3ConnectionFactory.setReadonlyProvider().then(() => {
                const web3Wrapper = Web3ConnectionFactory.currentWeb3Wrapper;
                const engine = Web3ConnectionFactory.currentWeb3Engine;
                const canWrite = Web3ConnectionFactory.canWrite;

                if (web3Wrapper && this.web3ProviderSettings) {
                    const contractsSource = new ContractsSource(engine, this.web3ProviderSettings.networkId, canWrite);
                    contractsSource.Init().then(() => {
                        this.web3Wrapper = web3Wrapper;
                        this.providerEngine = engine;
                        this.contractsSource = contractsSource;
                        this.eventEmitter.emit(StackerProviderEvents.ProviderAvailable);
                    });
                }
            });
        }



        return StackerProvider.Instance;
    }

    public static getLocalstorageItem(item: string): string {
        let response = "";
        try {
            response = localStorage.getItem(item) || "";
        } catch (e) {
            // console.log(e);
        }
        return response;
    }

    public static setLocalstorageItem(item: string, val: string) {
        try {
            localStorage.setItem(item, val);
        } catch (e) {
            // console.log(e);
        }
    }

    public async setWeb3Provider(connector: AbstractConnector, account?: string) {
        const providerType = await ProviderTypeDictionary.getProviderTypeByConnector(connector);
        try {
            this.isLoading = true;
            this.unsupportedNetwork = false;
            await Web3ConnectionFactory.setWalletProvider(connector, account);
        } catch (e) {
            // console.log(e);
            this.isLoading = false;

            return;
        }

        await this.setWeb3ProviderFinalize(providerType);
        this.isLoading = false;
    }

    public async setReadonlyWeb3Provider() {
        await Web3ConnectionFactory.setReadonlyProvider();
        await this.setWeb3ProviderFinalize(ProviderType.None);
        this.isLoading = false;
    }

    public async setWeb3ProviderFinalize(providerType: ProviderType) { // : Promise<boolean> {
        this.web3Wrapper = Web3ConnectionFactory.currentWeb3Wrapper;
        this.providerEngine = Web3ConnectionFactory.currentWeb3Engine;
        let canWrite = Web3ConnectionFactory.canWrite;
        const networkId = Web3ConnectionFactory.networkId;
        this.accounts = Web3ConnectionFactory.userAccount ? [Web3ConnectionFactory.userAccount] : [];


        if (this.web3Wrapper && networkId !== initialNetworkId) {
            // TODO: inform the user they are on the wrong network. Make it provider specific (MetaMask, etc)
            this.unsupportedNetwork = true;
            canWrite = false; // revert back to read-only
        }

        if (this.web3Wrapper && canWrite) {
            const web3EngineAccounts = await this.web3Wrapper.getAvailableAddressesAsync();
            if (web3EngineAccounts.length > 0 && this.accounts.length === 0)
                this.accounts = web3EngineAccounts;
            if (this.accounts.length === 0) {
                canWrite = false; // revert back to read-only
            }
        }

        if (this.web3Wrapper && this.web3ProviderSettings.networkId > 0) {
            const newContractsSource = await new ContractsSource(this.providerEngine, this.web3ProviderSettings.networkId, canWrite);
            await newContractsSource.Init();
            this.contractsSource = newContractsSource;
        } else {
            this.contractsSource = null;
        }

        this.providerType = canWrite
            ? providerType
            : ProviderType.None;

        StackerProvider.setLocalstorageItem('providerType', this.providerType);
    }

    public async setWeb3ProviderMobileFinalize(providerType: ProviderType, providerData: [Web3Wrapper | null, Web3ProviderEngine | null, boolean, number, string]) { // : Promise<boolean> {
        this.web3Wrapper = providerData[0];
        this.providerEngine = providerData[1];
        let canWrite = providerData[2];
        let networkId = providerData[3];
        const selectedAccount = providerData[4];

        this.web3ProviderSettings = await StackerProvider.getWeb3ProviderSettings(networkId);
        if (this.web3Wrapper) {
            if (this.web3ProviderSettings.networkName !== process.env.REACT_APP_ETH_NETWORK) {
                // TODO: inform the user they are on the wrong network. Make it provider specific (MetaMask, etc)

                this.unsupportedNetwork = true;
                canWrite = false; // revert back to read-only
                networkId = await this.web3Wrapper.getNetworkIdAsync();
                this.web3ProviderSettings = await StackerProvider.getWeb3ProviderSettings(networkId);
            } else {
                this.unsupportedNetwork = false;
            }
        }

        if (this.web3Wrapper && canWrite) {
            try {
                this.accounts = [selectedAccount]; // await this.web3Wrapper.getAvailableAddressesAsync() || [];

            } catch (e) {
                this.accounts = [];
            }
            if (this.accounts.length === 0) {
                canWrite = false; // revert back to read-only
            }
        } else {
            // this.accounts = [];
            if (providerType === ProviderType.Bitski && networkId !== 1) {
                this.unsupportedNetwork = true;
            }
        }
        if (this.web3Wrapper && this.web3ProviderSettings.networkId > 0) {
            this.contractsSource = await new ContractsSource(this.providerEngine, this.web3ProviderSettings.networkId, canWrite);
            //this.borrowRequestAwaitingStore = new BorrowRequestAwaitingStore(this.web3ProviderSettings.networkId, this.web3Wrapper);
            if (canWrite) {
                this.providerType = providerType;
            } else {
                this.providerType = ProviderType.None;
            }

            StackerProvider.setLocalstorageItem("providerType", providerType);
        } else {
            this.contractsSource = null;
        }

        if (this.contractsSource) {
            await this.contractsSource.Init();
        }
        StackerProvider.Instance.isLoading = false;
    }

    public static getWeb3ProviderSettings(networkId: number | null): IWeb3ProviderSettings {
        // tslint:disable-next-line:one-variable-per-declaration
        let networkName, etherscanURL;
        switch (networkId) {
            case 1:
                networkName = "mainnet";
                etherscanURL = "https://etherscan.io/";
                break;
            case 3:
                networkName = "ropsten";
                etherscanURL = "https://ropsten.etherscan.io/";
                break;
            case 4:
                networkName = "rinkeby";
                etherscanURL = "https://rinkeby.etherscan.io/";
                break;
            case 42:
                networkName = "kovan";
                etherscanURL = "https://kovan.etherscan.io/";
                break;
            default:
                networkId = 0;
                networkName = "local";
                etherscanURL = "";
                break;
        }
        return {
            networkId,
            networkName,
            etherscanURL
        };
    }

    public getErc20AddressOfAsset(asset: Asset): string | null {
        let result: string | null = null;

        const assetDetails = AssetsDictionary.assets.get(asset);
        if (this.web3ProviderSettings && assetDetails) {
            result = assetDetails.addressErc20.get(this.web3ProviderSettings.networkId) || "";
        }
        return result;
    }

    public async getAssetTokenBalanceOfUser(asset: Asset): Promise<BigNumber> {
        let result: BigNumber = new BigNumber(0);
        if (asset === Asset.UNKNOWN) {
            // always 0
            result = new BigNumber(0);
        } else {
            // get erc20 token balance
            const precision = AssetsDictionary.assets.get(asset)!.decimals || 18;
            const assetErc20Address = this.getErc20AddressOfAsset(asset);
            if (assetErc20Address) {
                result = await this.getErc20BalanceOfUser(assetErc20Address);
                result = result.multipliedBy(10 ** (18 - precision));
            }
        }

        return result;
    }

    private async getErc20BalanceOfUser(addressErc20: string, account?: string): Promise<BigNumber> {
        let result = new BigNumber(0);

        if (this.web3Wrapper && this.contractsSource) {
            if (!account && this.contractsSource.canWrite) {
                account = this.accounts.length > 0 && this.accounts[0] ? this.accounts[0].toLowerCase() : undefined;
            }

            if (account) {
                const tokenContract = await this.contractsSource.getErc20Contract(addressErc20);
                if (tokenContract) {
                    result = await tokenContract.balanceOf.callAsync(account);
                }
            }
        }

        return result;
    }


    public gasPrice = async (): Promise<BigNumber> => {
        let result = new BigNumber(30).multipliedBy(10 ** 9); // upper limit 30 gwei
        const lowerLimit = new BigNumber(3).multipliedBy(10 ** 9); // lower limit 3 gwei

        const url = `https://ethgasstation.info/json/ethgasAPI.json`;
        try {
            const response = await fetch(url);
            const jsonData = await response.json();
            // console.log(jsonData);
            if (jsonData.average) {
                // ethGasStation values need divide by 10 to get gwei
                const gasPriceAvg = new BigNumber(jsonData.average).multipliedBy(10 ** 8);
                const gasPriceSafeLow = new BigNumber(jsonData.safeLow).multipliedBy(10 ** 8);
                if (gasPriceAvg.lt(result)) {
                    result = gasPriceAvg;
                } else if (gasPriceSafeLow.lt(result)) {
                    result = gasPriceSafeLow;
                }
            }
        } catch (error) {
            // console.log(error);
            result = new BigNumber(12).multipliedBy(10 ** 9); // error default 8 gwei
        }

        if (result.lt(lowerLimit)) {
            result = lowerLimit;
        }

        return result;
    };
    public getLargeApprovalAmount = (asset: Asset): BigNumber => {
        switch (asset) {
            case Asset.BZRX:
            case Asset.BZRXv1:
                return new BigNumber(10 ** 18).multipliedBy(750000);
            default:
                throw new Error("Invalid approval asset!");
        }
    }

    public async convertBzrxV1ToV2(tokenAmount: BigNumber) {
        let receipt = null;

        const account = this.accounts.length > 0 && this.accounts[0] ? this.accounts[0].toLowerCase() : null;
        if (!this.contractsSource) return receipt;

        const convertContract = await this.contractsSource.getConvertContract();
        if (!account || !convertContract) return receipt;


        const assetErc20Address = this.getErc20AddressOfAsset(Asset.BZRXv1);
        if (!assetErc20Address) return receipt;
        const tokenErc20Contract = await this.contractsSource.getErc20Contract(assetErc20Address);

        // Detecting token allowance
        const erc20allowance = await tokenErc20Contract.allowance.callAsync(account, convertContract.address);

        if (tokenAmount.gt(erc20allowance)) {
            const approvePromise = await tokenErc20Contract!.approve.sendTransactionAsync(convertContract.address, tokenAmount, { from: account });
        }



        let gasAmountBN;
        let gasAmount;
        try {
            gasAmount = await convertContract.convert.estimateGasAsync(
                tokenAmount,
                {
                    from: account,
                    gas: this.gasLimit,
                });
            gasAmountBN = new BigNumber(gasAmount).multipliedBy(this.gasBufferCoeff).integerValue(BigNumber.ROUND_UP);

        }
        catch (e) {
            console.log(e);
            // throw e;
        }

        let txHash: string = "";
        try {
            txHash = await convertContract.convert.sendTransactionAsync(
                tokenAmount,
                {
                    from: account,
                    gas: this.gasLimit,
                    gasPrice: await this.gasPrice()
                });


        }
        catch (e) {
            console.log(e);
            // throw e;
        }

        const txReceipt = await this.waitForTransactionMined(txHash);
        return txReceipt.status === 1 ? txReceipt : null;
    }

    public waitForTransactionMined = async (
        txHash: string): Promise<any> => {

        return new Promise((resolve, reject) => {
            try {
                if (!this.web3Wrapper) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("web3 is not available");
                }

                this.waitForTransactionMinedRecursive(txHash, this.web3Wrapper, resolve, reject);
            } catch (e) {
                throw e;
            }
        });
    };

    private waitForTransactionMinedRecursive = async (
        txHash: string,
        web3Wrapper: Web3Wrapper,
        resolve: (value: any) => void,
        reject: (value: any) => void) => {

        try {
            const receipt = await web3Wrapper.getTransactionReceiptIfExistsAsync(txHash);
            if (receipt) {
                resolve(receipt);
            } else {
                window.setTimeout(() => {
                    this.waitForTransactionMinedRecursive(txHash, web3Wrapper, resolve, reject);
                }, 5000);
            }
        } catch (e) {
            reject(e);
        }
    };

}
new StackerProvider();