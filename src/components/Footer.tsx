import { Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">GSECD</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Global Socio-Economic Crisis Dashboard providing comprehensive analysis
              of food security and economic indicators worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Data Sources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• World Bank Open Data</li>
              <li>• Food and Agriculture Organization (FAO)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Methodology</li>
              {/* <li>• Data Dictionary</li> */}
              <li>• Terms of Use</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Global Socio-Economic Crisis Dashboard. All rights reserved.</p>
          <p className="mt-1">Data updated through 2024 • {" "}
            <span className="text-primary">Open Data Initiative</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
