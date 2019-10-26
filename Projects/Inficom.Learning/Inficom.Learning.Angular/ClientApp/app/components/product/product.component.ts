import { Component, OnInit, ViewChild } from '@angular/core';
import { IProduct } from '../../models/product';
import { DBOperation } from '../../shared/enum';
import { ToastrService } from 'toastr-ng2';
import { InputTextModule, DataTableModule, ButtonModule, DialogModule } from 'primeng/primeng';
import { ProductService } from '../../services/product.service';

@Component({
  templateUrl: './product.component.html'
})

export class ProductComponent implements OnInit {
    public rowData: any[];
    displayDialog: boolean;
    displayDeleteDialog: boolean;
    newProduct: boolean;
    products: IProduct[];
    product: IProduct;
    public editProductId: any;
    public fullname: string;

    constructor(private productService: ProductService) {
    
    }
        
    ngOnInit() {
        this.editProductId = 0;
        this.loadData();
    }

    loadData() {
        this.productService.get()
            .subscribe(res => {
                this.rowData = res.result;
            });
    }


    

}
