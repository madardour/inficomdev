using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Inficom.Cursus.Data.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    CategoryID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(maxLength: 15, nullable: false),
                    Description = table.Column<string>(type: "ntext", nullable: true),
                    Picture = table.Column<byte[]>(type: "image", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Customer",
                columns: table => new
                {
                    CustomerID = table.Column<string>(type: "nchar(5)", nullable: false),
                    CompanyName = table.Column<string>(maxLength: 40, nullable: false),
                    ContactName = table.Column<string>(maxLength: 30, nullable: true),
                    ContactTitle = table.Column<string>(maxLength: 30, nullable: true),
                    Address = table.Column<string>(maxLength: 60, nullable: true),
                    City = table.Column<string>(maxLength: 15, nullable: true),
                    Region = table.Column<string>(maxLength: 15, nullable: true),
                    PostalCode = table.Column<string>(maxLength: 10, nullable: true),
                    Country = table.Column<string>(maxLength: 15, nullable: true),
                    Phone = table.Column<string>(maxLength: 24, nullable: true),
                    Fax = table.Column<string>(maxLength: 24, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customer", x => x.CustomerID);
                });

            migrationBuilder.CreateTable(
                name: "CustomerDemographic",
                columns: table => new
                {
                    CustomerTypeID = table.Column<string>(type: "nchar(10)", nullable: false),
                    CustomerDesc = table.Column<string>(type: "ntext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerDemographic", x => x.CustomerTypeID);
                });

            migrationBuilder.CreateTable(
                name: "Employee",
                columns: table => new
                {
                    EmployeeID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LastName = table.Column<string>(maxLength: 20, nullable: false),
                    FirstName = table.Column<string>(maxLength: 10, nullable: false),
                    Title = table.Column<string>(maxLength: 30, nullable: true),
                    TitleOfCourtesy = table.Column<string>(maxLength: 25, nullable: true),
                    BirthDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    HireDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Address = table.Column<string>(maxLength: 60, nullable: true),
                    City = table.Column<string>(maxLength: 15, nullable: true),
                    Region = table.Column<string>(maxLength: 15, nullable: true),
                    PostalCode = table.Column<string>(maxLength: 10, nullable: true),
                    Country = table.Column<string>(maxLength: 15, nullable: true),
                    HomePhone = table.Column<string>(maxLength: 24, nullable: true),
                    Extension = table.Column<string>(maxLength: 4, nullable: true),
                    Photo = table.Column<byte[]>(type: "image", nullable: true),
                    Notes = table.Column<string>(type: "ntext", nullable: true),
                    ReportsTo = table.Column<int>(nullable: true),
                    PhotoPath = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employee", x => x.EmployeeID);
                });

            migrationBuilder.CreateTable(
                name: "Region",
                columns: table => new
                {
                    RegionID = table.Column<int>(nullable: false),
                    RegionDescription = table.Column<string>(type: "nchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Region", x => x.RegionID);
                });

            migrationBuilder.CreateTable(
                name: "Shipper",
                columns: table => new
                {
                    ShipperID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(maxLength: 40, nullable: false),
                    Phone = table.Column<string>(maxLength: 24, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shippers", x => x.ShipperID);
                });

            migrationBuilder.CreateTable(
                name: "Supplier",
                columns: table => new
                {
                    SupplierID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(maxLength: 40, nullable: false),
                    ContactName = table.Column<string>(maxLength: 30, nullable: true),
                    ContactTitle = table.Column<string>(maxLength: 30, nullable: true),
                    Address = table.Column<string>(maxLength: 60, nullable: true),
                    City = table.Column<string>(maxLength: 15, nullable: true),
                    Region = table.Column<string>(maxLength: 15, nullable: true),
                    PostalCode = table.Column<string>(maxLength: 10, nullable: true),
                    Country = table.Column<string>(maxLength: 15, nullable: true),
                    Phone = table.Column<string>(maxLength: 24, nullable: true),
                    Fax = table.Column<string>(maxLength: 24, nullable: true),
                    HomePage = table.Column<string>(type: "ntext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.SupplierID);
                });

            migrationBuilder.CreateTable(
                name: "CustomerCustomerDemo",
                columns: table => new
                {
                    CustomerID = table.Column<string>(type: "nchar(5)", nullable: false),
                    CustomerTypeID = table.Column<string>(type: "nchar(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerCustomerDemo", x => new { x.CustomerID, x.CustomerTypeID });
                    table.ForeignKey(
                        name: "FK_CustomerCustomerDemo_Customer",
                        column: x => x.CustomerID,
                        principalTable: "Customer",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerCustomerDemo",
                        column: x => x.CustomerTypeID,
                        principalTable: "CustomerDemographic",
                        principalColumn: "CustomerTypeID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Territory",
                columns: table => new
                {
                    TerritoryID = table.Column<string>(maxLength: 20, nullable: false),
                    TerritoryDescription = table.Column<string>(type: "nchar(50)", nullable: false),
                    RegionID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Territories", x => x.TerritoryID);
                    table.ForeignKey(
                        name: "FK_Territories_Region",
                        column: x => x.RegionID,
                        principalTable: "Region",
                        principalColumn: "RegionID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Order",
                columns: table => new
                {
                    OrderID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerID = table.Column<string>(type: "nchar(5)", nullable: true),
                    EmployeeID = table.Column<int>(nullable: true),
                    OrderDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    RequiredDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ShippedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ShipVia = table.Column<int>(nullable: true),
                    Freight = table.Column<decimal>(type: "money", nullable: true, defaultValueSql: "0"),
                    ShipName = table.Column<string>(maxLength: 40, nullable: true),
                    ShipAddress = table.Column<string>(maxLength: 60, nullable: true),
                    ShipCity = table.Column<string>(maxLength: 15, nullable: true),
                    ShipRegion = table.Column<string>(maxLength: 15, nullable: true),
                    ShipPostalCode = table.Column<string>(maxLength: 10, nullable: true),
                    ShipCountry = table.Column<string>(maxLength: 15, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Order", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK_Order_Customer",
                        column: x => x.CustomerID,
                        principalTable: "Customer",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Order_Employee",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Order_Shippers",
                        column: x => x.ShipVia,
                        principalTable: "Shipper",
                        principalColumn: "ShipperID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    ProductID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductName = table.Column<string>(maxLength: 40, nullable: false),
                    SupplierID = table.Column<int>(nullable: true),
                    CategoryID = table.Column<int>(nullable: true),
                    QuantityPerUnit = table.Column<string>(maxLength: 20, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "money", nullable: true, defaultValueSql: "0"),
                    UnitsInStock = table.Column<short>(nullable: true, defaultValueSql: "0"),
                    UnitsOnOrder = table.Column<short>(nullable: true, defaultValueSql: "0"),
                    ReorderLevel = table.Column<short>(nullable: true, defaultValueSql: "0"),
                    Discontinued = table.Column<bool>(nullable: false, defaultValueSql: "0")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.ProductID);
                    table.ForeignKey(
                        name: "FK_Product_Category",
                        column: x => x.CategoryID,
                        principalTable: "Category",
                        principalColumn: "CategoryID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Product_Suppliers",
                        column: x => x.SupplierID,
                        principalTable: "Supplier",
                        principalColumn: "SupplierID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeTerritory",
                columns: table => new
                {
                    EmployeeID = table.Column<int>(nullable: false),
                    TerritoryID = table.Column<string>(maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeTerritory", x => new { x.EmployeeID, x.TerritoryID });
                    table.ForeignKey(
                        name: "FK_EmployeeTerritory_Employee",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeTerritory_Territories",
                        column: x => x.TerritoryID,
                        principalTable: "Territory",
                        principalColumn: "TerritoryID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Order Details",
                columns: table => new
                {
                    OrderID = table.Column<int>(nullable: false),
                    ProductID = table.Column<int>(nullable: false),
                    UnitPrice = table.Column<decimal>(type: "money", nullable: false, defaultValueSql: "0"),
                    Quantity = table.Column<short>(nullable: false, defaultValueSql: "1"),
                    Discount = table.Column<float>(nullable: false, defaultValueSql: "0")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Order_Details", x => new { x.OrderID, x.ProductID });
                    table.ForeignKey(
                        name: "FK_Order_Details_Order",
                        column: x => x.OrderID,
                        principalTable: "Order",
                        principalColumn: "OrderID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Order_Details_Product",
                        column: x => x.ProductID,
                        principalTable: "Product",
                        principalColumn: "ProductID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "CategoryName",
                table: "Category",
                column: "CategoryName");

            migrationBuilder.CreateIndex(
                name: "City",
                table: "Customer",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "CompanyName",
                table: "Customer",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "PostalCode",
                table: "Customer",
                column: "PostalCode");

            migrationBuilder.CreateIndex(
                name: "Region",
                table: "Customer",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerCustomerDemo_CustomerTypeID",
                table: "CustomerCustomerDemo",
                column: "CustomerTypeID");

            migrationBuilder.CreateIndex(
                name: "LastName",
                table: "Employee",
                column: "LastName");

            migrationBuilder.CreateIndex(
                name: "PostalCode",
                table: "Employee",
                column: "PostalCode");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTerritory_TerritoryID",
                table: "EmployeeTerritory",
                column: "TerritoryID");

            migrationBuilder.CreateIndex(
                name: "CustomerOrder",
                table: "Order",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "EmployeeOrder",
                table: "Order",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "OrderDate",
                table: "Order",
                column: "OrderDate");

            migrationBuilder.CreateIndex(
                name: "ShipPostalCode",
                table: "Order",
                column: "ShipPostalCode");

            migrationBuilder.CreateIndex(
                name: "ShippersOrder",
                table: "Order",
                column: "ShipVia");

            migrationBuilder.CreateIndex(
                name: "ShippedDate",
                table: "Order",
                column: "ShippedDate");

            migrationBuilder.CreateIndex(
                name: "OrderOrder_Details",
                table: "Order Details",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "ProductOrder_Details",
                table: "Order Details",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "CategoryID",
                table: "Product",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "ProductName",
                table: "Product",
                column: "ProductName");

            migrationBuilder.CreateIndex(
                name: "SuppliersProduct",
                table: "Product",
                column: "SupplierID");

            migrationBuilder.CreateIndex(
                name: "CompanyName",
                table: "Supplier",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "PostalCode",
                table: "Supplier",
                column: "PostalCode");

            migrationBuilder.CreateIndex(
                name: "IX_Territory_RegionID",
                table: "Territory",
                column: "RegionID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerCustomerDemo");

            migrationBuilder.DropTable(
                name: "EmployeeTerritory");

            migrationBuilder.DropTable(
                name: "Order Details");

            migrationBuilder.DropTable(
                name: "CustomerDemographic");

            migrationBuilder.DropTable(
                name: "Territory");

            migrationBuilder.DropTable(
                name: "Order");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropTable(
                name: "Region");

            migrationBuilder.DropTable(
                name: "Customer");

            migrationBuilder.DropTable(
                name: "Employee");

            migrationBuilder.DropTable(
                name: "Shipper");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Supplier");
        }
    }
}
