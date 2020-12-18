namespace Inficom.Mvc5.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update01 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.OrderRelated",
                c => new
                    {
                        OrgOrderID = c.Int(nullable: false),
                        RelOrderID = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.OrgOrderID, t.RelOrderID })
                .ForeignKey("dbo.Order", t => t.OrgOrderID)
                .ForeignKey("dbo.Order", t => t.RelOrderID)
                .Index(t => t.OrgOrderID)
                .Index(t => t.RelOrderID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.OrderRelated", "RelOrderID", "dbo.Order");
            DropForeignKey("dbo.OrderRelated", "OrgOrderID", "dbo.Order");
            DropIndex("dbo.OrderRelated", new[] { "RelOrderID" });
            DropIndex("dbo.OrderRelated", new[] { "OrgOrderID" });
            DropTable("dbo.OrderRelated");
        }
    }
}
