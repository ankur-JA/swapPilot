import { ArrowRightIcon } from "@heroicons/react/24/outline";

export interface SwapRoute {
  fromToken: {
    symbol: string;
    address: string;
  };
  toToken: {
    symbol: string;
    address: string;
  };
  protocols: Array<{
    name: string;
    part: number; // percentage (0-100)
  }>;
  estimatedGas?: string;
  priceImpact?: number;
}

interface RouteVisualizerProps {
  route: SwapRoute | null;
  isLoading?: boolean;
}

export const RouteVisualizer = ({ route, isLoading = false }: RouteVisualizerProps) => {
  if (isLoading) {
    return (
      <div className="bg-base-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-base-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="bg-base-200 rounded-lg p-4 text-center text-accent">
        <p>No route available. Please select tokens and get a quote.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-3">
      {/* Route Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base-content">Swap Route</h3>
        {route.priceImpact && (
          <span
            className={`text-sm px-2 py-1 rounded ${
              route.priceImpact > 5
                ? "bg-error/20 text-error"
                : route.priceImpact > 1
                  ? "bg-warning/20 text-warning"
                  : "bg-success/20 text-success"
            }`}
          >
            {route.priceImpact.toFixed(2)}% impact
          </span>
        )}
      </div>

      {/* Route Flow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content">{route.fromToken.symbol}</span>
        </div>

        <div className="flex items-center gap-1">
          <ArrowRightIcon className="h-4 w-4 text-accent" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content">{route.toToken.symbol}</span>
        </div>
      </div>

      {/* Protocol Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-base-content">Protocols:</h4>
        <div className="space-y-1">
          {route.protocols.map((protocol, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-accent">{protocol.name}</span>
              <span className="text-base-content font-medium">{protocol.part}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gas Estimate */}
      {route.estimatedGas && (
        <div className="pt-2 border-t border-base-300">
          <div className="flex justify-between text-sm">
            <span className="text-accent">Estimated Gas:</span>
            <span className="text-base-content">{route.estimatedGas} ETH</span>
          </div>
        </div>
      )}
    </div>
  );
};
