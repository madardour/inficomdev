namespace Inficom.Mvc5.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class first : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Order",
                c => new
                    {
                        OrderID = c.Int(nullable: false, identity: true),
                        CustomerID = c.String(),
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
                    })
                .PrimaryKey(t => t.OrderID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.Order");
        }
    }
}
