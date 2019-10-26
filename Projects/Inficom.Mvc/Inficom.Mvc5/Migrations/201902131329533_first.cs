namespace Inficom.Mvc5.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class first : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Category",
                c => new
                    {
                        CategoryID = c.Int(nullable: false, identity: true),
                        CategoryName = c.String(),
                        Description = c.String(),
                        Picture = c.Binary(),
                    })
                .PrimaryKey(t => t.CategoryID);
            
            CreateTable(
                "dbo.Product",
                c => new
                    {
                        ProductID = c.Int(nullable: false, identity: true),
                        ProductName = c.String(),
                        SupplierID = c.Int(),
                        CategoryID = c.Int(),
                        QuantityPerUnit = c.String(),
                        UnitPrice = c.Decimal(precision: 18, scale: 2),
                        UnitsInStock = c.Short(),
                        UnitsOnOrder = c.Short(),
                        ReorderLevel = c.Short(),
                        Discontinued = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.ProductID)
                .ForeignKey("dbo.Category", t => t.CategoryID)
                .ForeignKey("dbo.Supplier", t => t.SupplierID)
                .Index(t => t.SupplierID)
                .Index(t => t.CategoryID);
            
            CreateTable(
                "dbo.Supplier",
                c => new
                    {
                        SupplierID = c.Int(nullable: false, identity: true),
                        CompanyName = c.String(),
                        ContactName = c.String(),
                        ContactTitle = c.String(),
                        Address = c.String(),
                        City = c.String(),
                        Region = c.String(),
                        PostalCode = c.String(),
                        Country = c.String(),
                        Phone = c.String(),
                        Fax = c.String(),
                        HomePage = c.String(),
                    })
                .PrimaryKey(t => t.SupplierID);
            
            CreateTable(
                "dbo.CustomerCustomerDemo",
                c => new
                    {
                        CustomerID = c.String(nullable: false, maxLength: 128),
                        CustomerTypeID = c.String(nullable: false, maxLength: 10),
                    })
                .PrimaryKey(t => new { t.CustomerID, t.CustomerTypeID })
                .ForeignKey("dbo.Customer", t => t.CustomerID, cascadeDelete: true)
                .ForeignKey("dbo.CustomerDemographic", t => t.CustomerTypeID, cascadeDelete: true)
                .Index(t => t.CustomerID)
                .Index(t => t.CustomerTypeID);
            
            CreateTable(
                "dbo.Customer",
                c => new
                    {
                        CustomerID = c.String(nullable: false, maxLength: 128),
                        CompanyName = c.String(),
                        ContactName = c.String(),
                        ContactTitle = c.String(),
                        Address = c.String(),
                        City = c.String(),
                        Region = c.String(),
                        PostalCode = c.String(),
                        Country = c.String(),
                        Phone = c.String(),
                        Fax = c.String(),
                    })
                .PrimaryKey(t => t.CustomerID);
            
            CreateTable(
                "dbo.Order",
                c => new
                    {
                        OrderID = c.Int(nullable: false, identity: true),
                        CustomerID = c.String(maxLength: 128),
                        EmployeeID = c.Int(),
                        OrderDate = c.DateTime(),
                        RequiredDate = c.DateTime(),
                        ShippedDate = c.DateTime(),
                        ShipVia = c.Int(),
                        Freight = c.Decimal(precision: 18, scale: 2),
                        ShipName = c.String(),
                        ShipAddress = c.String(),
                        ShipCity = c.String(),
                        ShipRegion = c.String(),
                        ShipPostalCode = c.String(),
                        ShipCountry = c.String(),
                        Shippers_ShipperID = c.Int(),
                    })
                .PrimaryKey(t => t.OrderID)
                .ForeignKey("dbo.Customer", t => t.CustomerID)
                .ForeignKey("dbo.Employee", t => t.EmployeeID)
                .ForeignKey("dbo.Shipper", t => t.Shippers_ShipperID)
                .Index(t => t.CustomerID)
                .Index(t => t.EmployeeID)
                .Index(t => t.Shippers_ShipperID);
            
            CreateTable(
                "dbo.Employee",
                c => new
                    {
                        EmployeeID = c.Int(nullable: false, identity: true),
                        LastName = c.String(),
                        FirstName = c.String(),
                        Title = c.String(),
                        TitleOfCourtesy = c.String(),
                        BirthDate = c.DateTime(),
                        HireDate = c.DateTime(),
                        Address = c.String(),
                        City = c.String(),
                        Region = c.String(),
                        PostalCode = c.String(),
                        Country = c.String(),
                        HomePhone = c.String(),
                        Extension = c.String(),
                        Photo = c.Binary(),
                        Notes = c.String(),
                        ReportsTo = c.Int(),
                        PhotoPath = c.String(),
                    })
                .PrimaryKey(t => t.EmployeeID);
            
            CreateTable(
                "dbo.Shipper",
                c => new
                    {
                        ShipperID = c.Int(nullable: false, identity: true),
                        CompanyName = c.String(),
                        Phone = c.String(),
                    })
                .PrimaryKey(t => t.ShipperID);
            
            CreateTable(
                "dbo.CustomerDemographic",
                c => new
                    {
                        CustomerTypeID = c.String(nullable: false, maxLength: 10),
                        CustomerDesc = c.String(),
                    })
                .PrimaryKey(t => t.CustomerTypeID);
            
            CreateTable(
                "dbo.EmployeeTerritory",
                c => new
                    {
                        EmployeeID = c.Int(nullable: false),
                        TerritoryID = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.EmployeeID, t.TerritoryID })
                .ForeignKey("dbo.Employee", t => t.EmployeeID, cascadeDelete: true)
                .ForeignKey("dbo.Territory", t => t.TerritoryID, cascadeDelete: true)
                .Index(t => t.EmployeeID)
                .Index(t => t.TerritoryID);
            
            CreateTable(
                "dbo.Territory",
                c => new
                    {
                        TerritoryID = c.Int(nullable: false, identity: true),
                        TerritoryDescription = c.String(),
                        Region_RegionID = c.Int(),
                    })
                .PrimaryKey(t => t.TerritoryID)
                .ForeignKey("dbo.Region", t => t.Region_RegionID)
                .Index(t => t.Region_RegionID);
            
            CreateTable(
                "dbo.Region",
                c => new
                    {
                        RegionID = c.Int(nullable: false, identity: true),
                        RegionDescription = c.String(),
                    })
                .PrimaryKey(t => t.RegionID);
            
            CreateTable(
                "dbo.OrderDetail",
                c => new
                    {
                        OrderID = c.Int(nullable: false),
                        ProductID = c.Int(nullable: false),
                        UnitPrice = c.Decimal(precision: 18, scale: 2),
                        Quantity = c.Short(),
                        Discount = c.Single(),
                    })
                .PrimaryKey(t => new { t.OrderID, t.ProductID })
                .ForeignKey("dbo.Order", t => t.OrderID, cascadeDelete: true)
                .ForeignKey("dbo.Product", t => t.ProductID, cascadeDelete: true)
                .Index(t => t.OrderID)
                .Index(t => t.ProductID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderDetail", "ProductID", "dbo.Product");
            DropForeignKey("dbo.OrderDetail", "OrderID", "dbo.Order");
            DropForeignKey("dbo.EmployeeTerritory", "TerritoryID", "dbo.Territory");
            DropForeignKey("dbo.Territory", "Region_RegionID", "dbo.Region");
            DropForeignKey("dbo.EmployeeTerritory", "EmployeeID", "dbo.Employee");
            DropForeignKey("dbo.CustomerCustomerDemo", "CustomerTypeID", "dbo.CustomerDemographic");
            DropForeignKey("dbo.CustomerCustomerDemo", "CustomerID", "dbo.Customer");
            DropForeignKey("dbo.Order", "Shippers_ShipperID", "dbo.Shipper");
            DropForeignKey("dbo.Order", "EmployeeID", "dbo.Employee");
            DropForeignKey("dbo.Order", "CustomerID", "dbo.Customer");
            DropForeignKey("dbo.Product", "SupplierID", "dbo.Supplier");
            DropForeignKey("dbo.Product", "CategoryID", "dbo.Category");
            DropIndex("dbo.OrderDetail", new[] { "ProductID" });
            DropIndex("dbo.OrderDetail", new[] { "OrderID" });
            DropIndex("dbo.Territory", new[] { "Region_RegionID" });
            DropIndex("dbo.EmployeeTerritory", new[] { "TerritoryID" });
            DropIndex("dbo.EmployeeTerritory", new[] { "EmployeeID" });
            DropIndex("dbo.Order", new[] { "Shippers_ShipperID" });
            DropIndex("dbo.Order", new[] { "EmployeeID" });
            DropIndex("dbo.Order", new[] { "CustomerID" });
            DropIndex("dbo.CustomerCustomerDemo", new[] { "CustomerTypeID" });
            DropIndex("dbo.CustomerCustomerDemo", new[] { "CustomerID" });
            DropIndex("dbo.Product", new[] { "CategoryID" });
            DropIndex("dbo.Product", new[] { "SupplierID" });
            DropTable("dbo.OrderDetail");
            DropTable("dbo.Region");
            DropTable("dbo.Territory");
            DropTable("dbo.EmployeeTerritory");
            DropTable("dbo.CustomerDemographic");
            DropTable("dbo.Shipper");
            DropTable("dbo.Employee");
            DropTable("dbo.Order");
            DropTable("dbo.Customer");
            DropTable("dbo.CustomerCustomerDemo");
            DropTable("dbo.Supplier");
            DropTable("dbo.Product");
            DropTable("dbo.Category");
        }
    }
}
