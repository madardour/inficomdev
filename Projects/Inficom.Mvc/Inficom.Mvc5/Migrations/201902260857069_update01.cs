namespace Inficom.Mvc5.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class update01 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Employee", "Salaris", c => c.Decimal(nullable: false, precision: 18, scale: 2));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Employee", "Salaris");
        }
    }
}
