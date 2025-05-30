
 
// import { Component } from '@angular/core';
// import { DataService } from '../../../service/data.service';
// import { ChangeDetectorRef } from '@angular/core'; // ✅ Import ChangeDetectorRef
// import { Router } from '@angular/router';
// import { CommonDataService } from '../../../Common/common-data.service';
 
// @Component({
//   selector: 'app-user-management',
//   templateUrl: './user-management.component.html',
//   styleUrls: ['./user-management.component.scss']
// })
 
 
// export class UserManagementComponent {
 
 
//   newClientId: number = 0;       // Stores new client ID
//   existingClientId: number = 0;  // Stores existing client ID
 
//   isUserCreated = false; // Track user creation status
// selectedClientType: string | null = null; // Track selected client type
 
 
 
 
//   activeTab: string = 'createUser';
//   existingClients: any[] = [];
//   existingProjects: any[] = [];
//   isUserAccessEnabled: boolean = false;
 
//   user = { email: '', password: '', contact: '', username: '' };
//   newClient = {
//     companyName: '', clientShortName: '', address: '', city: '', state: '',
//     country: '', pin: 0, gstno: '', panno: '', phone: '',
//     primaryContact: '', primaryEmail: '', secondaryContact: '', secondaryEmail: ''
//   };
 
//   userAccess = {
//     clientId: 0, companyName: '', projectId: 0, projectName: '', userId: 0,
//     district: '', machineId: '', merchantId: '', roleId: 0, state: ''
//   };
 
 
//     // List of states
//     states: any[] = [];
//     selectedState: string ='';
//     districts:any[] =[];
 
//   // List of roles
// roles: string[] = [
//   'Admin', 'Manager', 'Supervisor', 'Employee'
// ];
 
// // Mapping roles to their IDs
// roleMap: { [key: string]: number } = {
//   'Admin' : 1,
//   'Client': 2,
//   'State User': 3,
//   'District User': 4,
//   'End User': 5
// };
 
// // Selected role ID
// selectedRoleId: number = 0;
 
// machineList: string[] =[];
// showMachineDropdown = false;

 
//   constructor(private dataService: DataService, private cdr: ChangeDetectorRef, private router: Router,  private commonDataService: CommonDataService // ✅ Add this
//   ) {}
 
 
 
//   ngOnInit() {
//     const userData = JSON.parse(localStorage.getItem('userDetails') || '{}');
//     console.log("LOADED USER DATA : ",userData);
//     this.resetUserAccess(); // Reset form on refresh
//     this.loadStoredData();
//     this.getClients();
//     this.loadClientAndProjects();
//     this.loadStates();
//     this.districts = []; // Keep districts empty initially


//     this.userAccess.merchantId = this.commonDataService.getMerchantId();
//     this.machineList = userData?.machineId || [];
//     console.log("🛠 Machine List:", this.machineList); // <-- confirm it's loading

// }

// onRoleChange() {
//   this.userAccess.roleId = +this.userAccess.roleId; // convert to number
//   this.showMachineDropdown = this.userAccess.roleId===5;
// }

 
 
//   // Load all states from API
//   loadStates() {
//     this.dataService.getStates().subscribe(response => {
//       if (response && response.states) {
//         this.states = response.states; // List of state objects
//       }
//     });
//   }
 
//   onStateChange() {
//     if (this.selectedState) {
 
//       this.userAccess.state = this.selectedState;
 
//         let formattedState = encodeURIComponent(this.selectedState.trim()); // Encode spaces properly
//         console.log('Fetching districts for:', formattedState); // Debugging log
 
//         this.dataService.getDistricts(formattedState).subscribe(response => {
//             console.log('District API Response:', response); // Debugging log
 
//             if (response && response.districts) {
//                 this.districts = response.districts;
//             } else {
//                 console.error('No districts found for this state.');
//                 this.districts = []; // Reset dropdown if no data
//             }
//         }, error => {
//             console.error('Error fetching districts:', error);
//         });
//     } else {
//         this.districts = []; // Reset if no state is selected
//     }
// }
 
// // Function to check if "User Access" tab should be enabled
// canAccessUserTab(): boolean {
//   return this.isUserCreated && this.selectedClientType !== null;
// }
 
   
 
//     updateRoleId(selectedRole: string) {
//       this.selectedRoleId = this.roleMap[selectedRole] || 0; // Get Role ID
//       this.userAccess.roleId = this.selectedRoleId; // Assign to userAccess
   
//       console.log('Selected Role:', selectedRole);
//       console.log('Role ID:', this.selectedRoleId);
//     }
   
   
 
//   resetUserAccess() {
//     this.userAccess = {
//       clientId: 0,       // 🔥 Reset clientId to avoid persistent localStorage value
//       companyName: '',
//       projectId: 0,
//       projectName: '',
//       userId: 0,
//       district: '',
//       machineId: '',
//       merchantId: '',
//       roleId: 0,
//       state: ''
//     };
//   }
 
 
//   /** Load stored data from localStorage */
//   loadStoredData() {
//     const storedUserId = localStorage.getItem('userId');
//     const storedNewClientId = localStorage.getItem('newClientId');
//     const storedExistingClientId = localStorage.getItem('existingClientId');
 
//     this.userAccess.userId = storedUserId ? parseInt(storedUserId) : 0;
//     this.newClientId = storedNewClientId ? parseInt(storedNewClientId) : 0;
//     this.existingClientId = storedExistingClientId ? parseInt(storedExistingClientId) : 0;
 
//     // ✅ Set the correct client ID based on selection type
//     if (this.selectedClientType === 'new') {
//       this.userAccess.clientId = this.newClientId;
//     } else if (this.selectedClientType === 'existing') {
//       this.userAccess.clientId = this.existingClientId;
//     }
 
//     console.log('Loaded Stored Client IDs - New:', this.newClientId, 'Existing:', this.existingClientId);
   
//     this.checkUserAccessEnabled();
//   }
 
//   /** Switch between tabs */
//   setActiveTab(tab: string, event: Event) {
//     event.preventDefault();
//     this.activeTab =tab;
 
//     if (tab === 'userAccess'){
//     this.resetUserAccess(); // 🔥 Reset before loading new data
//     this.loadStoredData();   // Reload fresh data
//     this.loadClientAndProjects(); // Fetch updated client and project data
 
//         // ✅ Set correct client ID based on selection type
//         if (this.selectedClientType === 'new') {
//           this.userAccess.clientId = this.newClientId;
//         } else if (this.selectedClientType === 'existing') {
//           this.userAccess.clientId = this.existingClientId;
//         }
 
//         console.log('User Access Client ID:', this.userAccess.clientId);
 
   
//     }
//   }
 
//   /** Create User and store userId */
//   createUser() {
//     const merchantId = this.commonDataService.getMerchantId(); // ✅ Get merchantId
 
//     const requestData = {
//       email: this.user.email,
//       password: this.user.password,
//       primaryContactNumber: this.user.contact,
//       userName: this.user.username,
//       merchantId:merchantId
 
//     };
 
//     this.dataService.saveAndUpdateUser(requestData).subscribe((response: any) => {
//       if (response.code === 200) {
//         alert('User Created Successfully!');
 
//       // ✅ Mark user as created
//       this.isUserCreated = true;
 
//       // ✅ Check if client type is selected
//       if (this.canAccessUserTab()) {
//         // ✅ Switch to "User Access" tab only if both conditions are met
//         this.activeTab = 'userAccess';
//       }
 
//         this.userAccess.userId = response.data.userId;
//         localStorage.setItem('userId', response.data.userId.toString());
//         this.checkUserAccessEnabled();
//       } else {
//         alert(response.phrase || 'Error creating user');
//       }
//     });
//   }
 
//   /** Create new client and store clientId */
//   createClient() {
//     this.dataService.createClient(this.newClient).subscribe((response: any) => {
//       if (response.code === 200) {
//         alert('Client Created Successfully!');
//         console.log(response)
 
//       // ✅ Store new client ID separately
//       this.newClientId = response.data.clientId;
//       this.userAccess.companyName = this.newClient.companyName;
 
//       // ✅ Only update userAccess.clientId if "new" client type is selected
//       if (this.selectedClientType === 'new') {
//         this.userAccess.clientId = this.newClientId;
//       }
 
//       localStorage.setItem('newClientId', this.newClientId.toString());
 
//       // ✅ Ensure UI updates
//                 // ✅ Detect changes to prevent blinking
//                 this.isUserAccessEnabled = true;
//                 this.cdr.detectChanges();
 
//               } else {
//         alert(response.phrase || 'Error creating client');
//       }
//     });
//   }
 
//   /** Fetch existing clients for dropdown */
//   getClients() {
//     this.dataService.getExistingClients().subscribe(response => {
//       if (response.code === 200) {
//         this.existingClients = response.data;
//       }
//     });
//   }
 
// loadClientAndProjects() {
//   if (this.selectedClientType !== 'existing') {
//     return; // ❌ Do nothing if 'New Client' is selected
//   }
 
//   console.log('📡 Fetching details for Existing Client...');
 
//   // ✅ Fetch Client Details
//   this.dataService.getClientDetails().subscribe(client => {
//     if (client && client.id) {
//       this.userAccess.clientId = client.id;
//       this.userAccess.companyName = client.companyName;
//       localStorage.setItem('clientId', client.id.toString());
 
//       console.log('✅ Client Loaded:', client);
 
//       this.cdr.detectChanges();
//     }
//   });
 
//   // ✅ Fetch Project Details
//   this.dataService.getProjectDetails().subscribe(projects => {
//     this.existingProjects = projects;
//     if (projects.length > 0) {
//       this.userAccess.projectId = projects[0].projectId; // Default to first project
//       this.userAccess.projectName = projects[0].projectName;
//     }
//     console.log('✅ Projects Loaded:', projects);
//   });
// }
 
// onClientSelectionChange(clientId: number) {
//   console.log('🟢 Client Selected:', this.selectedClientType, clientId);
 
//   if (this.selectedClientType === 'existing') {
//     this.userAccess.clientId = clientId;
 
//     const selectedClient = this.existingClients.find(client => client.id === clientId);
//     if (selectedClient) {
//       this.userAccess.companyName = selectedClient.companyName;
//       localStorage.setItem('existingclientId', clientId.toString());
//     }
 
//     this.loadClientAndProjects(); // ✅ Fetch client & project details
//   }
 
//     // ✅ Check if user is already created and switch tab
//     if (this.isUserCreated && this.selectedClientType !== null) {
//       this.activeTab = 'userAccess';
//     }
 
 
 
//   this.cdr.detectChanges();
// }
 
//   checkUserAccessEnabled() {
//     this.isUserAccessEnabled = this.userAccess.userId !== 0 && this.userAccess.clientId !== 0;
//   }
//   /** Assign user access */
  
//   assignUserAccess() {
//     const merchantId = this.commonDataService.getMerchantId(); // ✅ Get merchantId

//     const requestData = {
//       clientId: this.userAccess.clientId,
//       userId: this.userAccess.userId,
//       companyName: this.userAccess.companyName,
//       projectId: this.userAccess.projectId,
//       projectName: this.userAccess.projectName,
//       district: this.userAccess.district,
//       machineId: this.userAccess.machineId,
//       merchantId: this.userAccess.merchantId,
//       roleId: this.userAccess.roleId,
//       state: this.userAccess.state
//     };
 
//     if (!this.isUserAccessEnabled) {
//       alert('User Access cannot be assigned until User ID and Client ID are set.');
//       return;
//     }
 
 
//     this.dataService.assignUserAccess(requestData).subscribe(response => {
//       if (response.code === 200) {
//         alert('User Access Assigned Successfully!');
//         console.log(requestData);
 
//         //this.submitUser();
 
//       }
//     });
//   }
 
//   }  






import { Component } from '@angular/core';
import { DataService } from '../../../service/data.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonDataService } from '../../../Common/common-data.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
 
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
 
export class UserManagementComponent {
  newClientId: number = 0;
  existingClientId: number = 0;
 
  isUserCreated = false;
  selectedClientType: string | null = null;
 
  activeTab: string = 'createUser';
  existingClients: any[] = [];
  existingProjects: any[] = [];
  isUserAccessEnabled: boolean = false;
 
  user = { email: '', password: '', contact: '', username: '' };
  newClient = {
    companyName: '', clientShortName: '', address: '', city: '', state: '',
    country: '', pin: 0, gstno: '', panno: '', phone: '',
    primaryContact: '', primaryEmail: '', secondaryContact: '', secondaryEmail: ''
  };
 
  userAccess = {
    clientId: 0, companyName: '', projectId: 0, projectName: '', userId: 0,
    district: '', machineId: '', merchantId: '', roleId: 0, state: ''
  };
 
  // List of states
  states: any[] = [];
  selectedState: string = '';
  districts: any[] = [];
  
  // Machine level data
  machineLevelData: any[] = [];
  companyNames: string[] = [];
  projectNames: any[] = [];
  availableStates: any[] = [];
  availableDistricts: any[] = [];
  
  // List of roles
  roles: string[] = [
    'Admin', 'Manager', 'Supervisor', 'Employee'
  ];
  
  // Mapping roles to their IDs
  roleMap: { [key: string]: number } = {
    'Admin' : 1,
    'Client': 2,
    'State User': 3,
    'District User': 4,
    'End User': 5
  };
  
  // Selected role ID
  selectedRoleId: number = 0;
  
  machineList: string[] = [];
  showMachineDropdown = false;
  selectedStateId: number | null = null;
  selectedDistrictId: number | null = null;


  projectStates: { [projectId: number]: number } = {};
  projectDistricts: { [stateId: number]: any[] } = {};

  successMessage: string = '';
  showSuccessMessage: boolean = false;



  constructor(
    private dataService: DataService, 
    private cdr: ChangeDetectorRef, 
    private router: Router,  
    private commonDataService: CommonDataService
  ) {}
 
  ngOnInit() {

    if(this.commonDataService.merchantId === null || this.commonDataService.merchantId === undefined
      && this.commonDataService.userId === null || this.commonDataService.userId === undefined) {
     
      this.router.navigate(['/login']);
    }

    const userData = JSON.parse(localStorage.getItem('userDetails') || '{}');
    console.log("LOADED USER DATA : ", userData);
    this.resetUserAccess();
    this.loadStoredData();
    this.getClients();
    this.loadClientAndProjects();
    this.loadStates();
    this.districts = [];

    this.userAccess.merchantId = this.commonDataService.getMerchantId();
    this.machineList = userData?.machineId || [];
    console.log("🛠 Machine List:", this.machineList);
  }

  // Helper method for the template to safely get role names
  getRoleNames(): string[] {
    return Object.keys(this.roleMap || {});
  }

  onRoleChange() {
    this.userAccess.roleId = +this.userAccess.roleId;
    this.showMachineDropdown = this.userAccess.roleId === 5;
  }
 
  loadStates() {
    this.dataService.getStates().subscribe({
      next: (response) => {
        if (response && response.states) {
          this.states = response.states;
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });
  }
 
  onStateChange() {
    if (this.selectedState) {
      this.userAccess.state = this.selectedState;
 
      let formattedState = encodeURIComponent(this.selectedState.trim());
      console.log('Fetching districts for:', formattedState);
 
      this.dataService.getDistricts(formattedState).subscribe({
        next: (response) => {
          console.log('District API Response:', response);
 
          if (response && response.districts) {
            this.districts = response.districts;
          } else {
            console.error('No districts found for this state.');
            this.districts = [];
          }
        },
        error: (error) => {
          console.error('Error fetching districts:', error);
          this.districts = [];
        }
      });
    } else {
      this.districts = [];
    }
  }
 
  canAccessUserTab(): boolean {
    return this.isUserCreated && this.selectedClientType !== null;
  }
 
  updateRoleId(selectedRole: string) {
    this.selectedRoleId = this.roleMap[selectedRole] || 0;
    this.userAccess.roleId = this.selectedRoleId;
 
    console.log('Selected Role:', selectedRole);
    console.log('Role ID:', this.selectedRoleId);
  }
   
  resetUserAccess() {
    this.userAccess = {
      clientId: 0,
      companyName: '',
      projectId: 0,
      projectName: '',
      userId: 0,
      district: '',
      machineId: '',
      merchantId: '',
      roleId: 0,
      state: ''
    };
  }
 
  loadStoredData() {
    const storedUserId = localStorage.getItem('userId');
    const storedNewClientId = localStorage.getItem('newClientId');
    const storedExistingClientId = localStorage.getItem('existingClientId');
 
    this.userAccess.userId = storedUserId ? parseInt(storedUserId) : 0;
    this.newClientId = storedNewClientId ? parseInt(storedNewClientId) : 0;
    this.existingClientId = storedExistingClientId ? parseInt(storedExistingClientId) : 0;
 
    if (this.selectedClientType === 'new') {
      this.userAccess.clientId = this.newClientId;
    } else if (this.selectedClientType === 'existing') {
      this.userAccess.clientId = this.existingClientId;
    }
 
    console.log('Loaded Stored Client IDs - New:', this.newClientId, 'Existing:', this.existingClientId);
   
    this.checkUserAccessEnabled();
  }
 
  setActiveTab(tab: string, event: Event) {
    event.preventDefault();
    this.activeTab = tab;
 
    if (tab === 'userAccess') {
      this.resetUserAccess();
      this.loadStoredData();
      this.loadClientAndProjects();
      this.loadMachineLevelData();
 
      if (this.selectedClientType === 'new') {
        this.userAccess.clientId = this.newClientId;
      } else if (this.selectedClientType === 'existing') {
        this.userAccess.clientId = this.existingClientId;
      }
 
      console.log('User Access Client ID:', this.userAccess.clientId);
    }
  }
 
  loadMachineLevelData() {
    const merchantId = this.commonDataService.getMerchantId();
    console.log('Fetching machine level data for merchant ID:', merchantId);
    
    this.dataService.getMachineLevelData(merchantId)
      .pipe(
        catchError(error => {
          console.log('Error fetching machine level data:', error);
          return of({ code: 0, data: [] });
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.code === 200 && response.data) {
            this.machineLevelData = response.data;
            console.log('Machine Level Data:', this.machineLevelData);
            
            // Extract company names
            this.companyNames = this.machineLevelData.map(company => company.levelName);
            
            // Default to first company if available
            if (this.machineLevelData.length > 0) {
              this.userAccess.companyName = this.machineLevelData[0].levelName;
              this.onCompanySelect(this.userAccess.companyName);
            }
            this.cdr.detectChanges();
          } else {
            console.error('Invalid response format or error:', response);
            this.machineLevelData = [];
            this.companyNames = [];
          }
        },
        error: (error) => {
          console.error('Error fetching machine level data:', error);
          this.machineLevelData = [];
          this.companyNames = [];
        }
      });
  }
  
  // onCompanySelect(companyName: string) {
  //   const selectedCompany = this.machineLevelData.find(company => company.levelName === companyName);
  //   if (selectedCompany) {
  //     this.userAccess.companyName = companyName;
      
  //     // Extract projects (subLevels for the first level)
  //     this.projectNames = (selectedCompany.subLevels || []).map((project: any) => {
  //       return {
  //         id: project.id,
  //         name: project.levelName
  //       };
  //     });
      
  //     // Reset other dropdown fields
  //     this.availableStates = [];
  //     this.availableDistricts = [];
  //     this.userAccess.projectId = 0; // Reset project ID
  //     this.userAccess.projectName = ''; // Reset project name
  //     this.userAccess.state = '';
  //     this.userAccess.district = '';
  //     this.selectedStateId = null;
  //     this.selectedDistrictId = null;
      
  //     this.cdr.detectChanges();
  //   }
  // }  
  // onProjectSelect(projectId: number) {
  //   const selectedCompany = this.machineLevelData.find(company => 
  //     company.levelName === this.userAccess.companyName);
      
  //   if (selectedCompany) {
  //     const selectedProject = (selectedCompany.subLevels || []).find((project: any) => project.id === projectId);
      
  //     if (selectedProject) {
  //       this.userAccess.projectId = projectId;
  //       this.userAccess.projectName = selectedProject.levelName;
        
  //       // Extract states (subLevels for the second level)
  //       this.availableStates = (selectedProject.subLevels || []).map((state: any) => {
  //         return {
  //           id: state.id,
  //           name: state.levelName
  //         };
  //       });
        
  //       // Reset district dropdown
  //       this.availableDistricts = [];
  //       this.userAccess.state = '';
  //       this.userAccess.district = '';
        
  //       this.cdr.detectChanges();
  //     }
  //   }
  // }
  
  // onMachineStateSelect(stateId: number) {
  //   const selectedCompany = this.machineLevelData.find(company => 
  //     company.levelName === this.userAccess.companyName);
      
  //   if (selectedCompany) {
  //     const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
  //       project.id === this.userAccess.projectId);
        
  //     if (selectedProject) {
  //       const selectedState = (selectedProject.subLevels || []).find((state: any) => state.id === stateId);
        
  //       if (selectedState) {
  //         this.userAccess.state = selectedState.levelName;
          
  //         // Extract districts (subLevels for the third level)
  //         this.availableDistricts = (selectedState.subLevels || []).map((district: any) => {
  //           return {
  //             id: district.id,
  //             name: district.levelName
  //           };
  //         });
          
  //         this.userAccess.district = '';
  //         this.cdr.detectChanges();
  //       }
  //     }
  //   }
  // }
  

  // onDistrictSelect(districtId: number) {
  //   const district = this.availableDistricts.find(d => d.id === districtId);
  //   if (district) {
  //     this.userAccess.district = district.name;
  //   }
  // }


  // onProjectSelect(projectId: number) {
  //   console.log('Project selected:', projectId);
    
  //   // Convert string to number if needed
  //   projectId = +projectId;
    
  //   // Find the selected company
  //   const selectedCompany = this.machineLevelData.find(company => 
  //     company.levelName === this.userAccess.companyName);
      
  //   if (selectedCompany) {
  //     console.log('Found company:', selectedCompany.levelName);
      
  //     // Find the selected project within the company
  //     const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
  //       project.id === projectId);
      
  //     if (selectedProject) {
  //       console.log('Found project:', selectedProject.levelName);
  //       this.userAccess.projectId = projectId;
  //       this.userAccess.projectName = selectedProject.levelName;
        
  //       // Extract states (subLevels for the second level)
  //       this.availableStates = (selectedProject.subLevels || []).map((state: any) => {
  //         return {
  //           id: state.id,
  //           name: state.levelName
  //         };
  //       });
        
  //       console.log('Available states:', this.availableStates);
        
  //       // Reset district dropdown and state selection
  //       this.availableDistricts = [];
  //       this.userAccess.state = '';
  //       this.userAccess.district = '';
        
  //       // Force UI update
  //       setTimeout(() => {
  //         this.cdr.detectChanges();
  //       });
  //     } else {
  //       console.error('Project not found with ID:', projectId);
  //     }
  //   } else {
  //     console.error('Company not found with name:', this.userAccess.companyName);
  //   }
  // }
  
  // onMachineStateSelect(stateId: any) {
  //   console.log('State selected (raw):', stateId);
    
  //   // Parse to number if needed
  //   stateId = parseInt(stateId, 10);
  //   console.log('State selected (parsed):', stateId);
    
  //   // Find the selected company
  //   const selectedCompany = this.machineLevelData.find(company => 
  //     company.levelName === this.userAccess.companyName);
      
  //   if (selectedCompany) {
  //     // Find the selected project
  //     const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
  //       project.id === this.userAccess.projectId);
        
  //     if (selectedProject) {
  //       // Find the selected state
  //       const selectedState = (selectedProject.subLevels || []).find((state: any) => 
  //         state.id === stateId);
        
  //       if (selectedState) {
  //         console.log('Found state:', selectedState.levelName);
  //         this.userAccess.state = selectedState.levelName;
          
  //         // Extract districts (subLevels for the third level)
  //         this.availableDistricts = (selectedState.subLevels || []).map((district: any) => {
  //           return {
  //             id: district.id,
  //             name: district.levelName
  //           };
  //         });
          
  //         console.log('Available districts:', this.availableDistricts);
          
  //         // Reset district selection
  //         this.userAccess.district = '';
          
  //         // Force UI update
  //         setTimeout(() => {
  //           this.cdr.detectChanges();
  //         });
  //       } else {
  //         console.error('State not found with ID:', stateId);
  //       }
  //     } else {
  //       console.error('Project not found with ID:', this.userAccess.projectId);
  //     }
  //   } else {
  //     console.error('Company not found with name:', this.userAccess.companyName);
  //   }
  // }




  
  // onDistrictSelect(districtId: number) {

  //   console.log('District selected:', districtId);
    
  //   const district = this.availableDistricts.find(d => d.id === districtId);
  //   if (district) {
  //     this.userAccess.district = district.name;
  //   }
  // }


//   onMachineStateSelect(stateId: any) {
//     console.log('State selected (raw):', stateId);
    
//     // Parse to number if needed
//     stateId = parseInt(stateId, 10);
//     console.log('State selected (parsed):', stateId);
    
//     // Find the selected company
//     const selectedCompany = this.machineLevelData.find(company => 
//       company.levelName === this.userAccess.companyName);
      
//     if (selectedCompany) {
//       // Find the selected project
//       const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
//         project.id === this.userAccess.projectId);
        
//       if (selectedProject) {
//         // Find the selected state
//         const selectedState = (selectedProject.subLevels || []).find((state: any) => 
//           state.id === stateId);
        
//         if (selectedState) {
//           console.log('Found state:', selectedState.levelName);
//           this.userAccess.state = selectedState.levelName;
          
//           // Store the currently selected state ID in a separate property for the dropdown
//           this.selectedStateId = stateId;
          
//           // Extract districts (subLevels for the third level)
//           this.availableDistricts = (selectedState.subLevels || []).map((district: any) => {
//             return {
//               id: district.id,
//               name: district.levelName
//             };
//           });
          
//           console.log('Available districts:', this.availableDistricts);
          
//           // Reset district selection
//           this.userAccess.district = '';
//           this.selectedDistrictId = null;
//           // Force UI update
//           setTimeout(() => {
//             this.cdr.detectChanges();
//           });
//         } else {
//           console.error('State not found with ID:', stateId);
//         }
//       } else {
//         console.error('Project not found with ID:', this.userAccess.projectId);
//       }
//     } else {
//       console.error('Company not found with name:', this.userAccess.companyName);
//     }
// }




onProjectSelect(projectId: number) {
  console.log('Project selected:', projectId);
  
  // Convert string to number if needed
  projectId = +projectId;
  
  // Find the selected company
  const selectedCompany = this.machineLevelData.find(company => 
    company.levelName === this.userAccess.companyName);
    
  if (selectedCompany) {
    console.log('Found company:', selectedCompany.levelName);
    
    // Find the selected project within the company
    const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
      project.id === projectId);
    
    if (selectedProject) {
      console.log('Found project:', selectedProject.levelName);
      this.userAccess.projectId = projectId;
      this.userAccess.projectName = selectedProject.levelName;
      
      // Extract states (subLevels for the second level)
      this.availableStates = (selectedProject.subLevels || []).map((state: any) => {
        return {
          id: state.id,
          name: state.levelName
        };
      });
      
      console.log('Available states:', this.availableStates);
      
      // Check if we had previously selected a state for this project
      if (this.projectStates[projectId]) {
        // Restore the previously selected state
        this.selectedStateId = this.projectStates[projectId];
        
        // Trigger state selection to restore districts
        this.onMachineStateSelect(this.selectedStateId);
      } else {
        // Reset district dropdown and state selection
        this.availableDistricts = [];
        this.selectedStateId = null;
        this.selectedDistrictId = null;
        this.userAccess.state = '';
        this.userAccess.district = '';
      }
      
      // Force UI update
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    } else {
      console.error('Project not found with ID:', projectId);
    }
  } else {
    console.error('Company not found with name:', this.userAccess.companyName);
  }
}

onMachineStateSelect(stateId: any) {
  console.log('State selected (raw):', stateId);
  
  // Parse to number if needed
  stateId = parseInt(stateId, 10);
  console.log('State selected (parsed):', stateId);
  
  // Find the selected company
  const selectedCompany = this.machineLevelData.find(company => 
    company.levelName === this.userAccess.companyName);
    
  if (selectedCompany) {
    // Find the selected project
    const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
      project.id === this.userAccess.projectId);
      
    if (selectedProject) {
      // Find the selected state
      const selectedState = (selectedProject.subLevels || []).find((state: any) => 
        state.id === stateId);
      
      if (selectedState) {
        console.log('Found state:', selectedState.levelName);
        this.userAccess.state = selectedState.levelName;
        
        // Store the currently selected state ID in a separate property for the dropdown
        this.selectedStateId = stateId;
        
        // Store the selected state for this project for future reference
        this.projectStates[this.userAccess.projectId] = stateId;
        
        // Extract districts (subLevels for the third level)
        this.availableDistricts = (selectedState.subLevels || []).map((district: any) => {
          return {
            id: district.id,
            name: district.levelName
          };
        });
        
        // Store districts for this state
        this.projectDistricts[stateId] = [...this.availableDistricts];
        
        console.log('Available districts:', this.availableDistricts);
        
        // Reset district selection
        this.userAccess.district = '';
        this.selectedDistrictId = null;
        
        // Force UI update
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      } else {
        console.error('State not found with ID:', stateId);
      }
    } else {
      console.error('Project not found with ID:', this.userAccess.projectId);
    }
  } else {
    console.error('Company not found with name:', this.userAccess.companyName);
  }
}

// Reset tracking when company changes
onCompanySelect(companyName: string) {
  const selectedCompany = this.machineLevelData.find(company => company.levelName === companyName);
  if (selectedCompany) {
    this.userAccess.companyName = companyName;
    
    // Extract projects (subLevels for the first level)
    this.projectNames = (selectedCompany.subLevels || []).map((project: any) => {
      return {
        id: project.id,
        name: project.levelName
      };
    });
    
    // Reset other dropdown fields
    this.availableStates = [];
    this.availableDistricts = [];
    this.selectedStateId = null;
    this.selectedDistrictId = null;
    this.userAccess.projectId = 0;
    this.userAccess.projectName = '';
    this.userAccess.state = '';
    this.userAccess.district = '';
    
    // Reset project tracking
    this.projectStates = {};
    this.projectDistricts = {};
    
    this.cdr.detectChanges();
  }
}

onDistrictSelect(districtId: number) {
  // Update the selected district ID tracker
  this.selectedDistrictId = districtId;
  
  // Find the current state
  const selectedCompany = this.machineLevelData.find(company => 
    company.levelName === this.userAccess.companyName);
    
  if (selectedCompany) {
    const selectedProject = (selectedCompany.subLevels || []).find((project: any) => 
      project.id === this.userAccess.projectId);
      
    if (selectedProject) {
      const selectedState = (selectedProject.subLevels || []).find((state: any) => 
        state.id === this.selectedStateId);
      
      if (selectedState) {
        // Find the selected district
        const selectedDistrict = (selectedState.subLevels || []).find((district: any) => 
          district.id === districtId);
        
        if (selectedDistrict) {
          // Store the district name in userAccess
          this.userAccess.district = selectedDistrict.levelName;
        } else {
          console.error('District not found with ID:', districtId);
        }
      }
    }
  }
}

isClientCreated(): boolean {
  if (this.selectedClientType === 'existing') {
    // For existing client, check if a valid client ID is selected
    return this.userAccess.clientId > 0;
  } else if (this.selectedClientType === 'new') {
    // For new client, check if a client was created (newClientId is set)
    return this.newClientId > 0;
  }
  
  // No valid selection
  return false;
}

createUser() {
    const merchantId = this.commonDataService.getMerchantId();
 
    const requestData = {
      email: this.user.email,
      password: this.user.password,
      primaryContactNumber: this.user.contact,
      userName: this.user.username,
      merchantId: merchantId
    };
 
    this.dataService.saveAndUpdateUser(requestData).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          // alert('User Created Successfully!');

                  // Show success message instead of alert
        this.successMessage = 'User Created Successfully!';
        this.showSuccessMessage = true;


 
          this.isUserCreated = true;
 
          if (this.canAccessUserTab()) {
            this.activeTab = 'userAccess';
            this.loadMachineLevelData();
          }
 
          this.userAccess.userId = response.data.userId;
          localStorage.setItem('userId', response.data.userId.toString());
          this.checkUserAccessEnabled();
        // After 5 seconds, hide message and navigate to next tab
        setTimeout(() => {
          this.showSuccessMessage = false;
          
          if (this.canAccessUserTab()) {
            this.activeTab = 'userAccess';
            this.loadMachineLevelData();
          }
          this.cdr.detectChanges();
        }, 1000);
      } else {
        alert(response.phrase || 'Error creating user');
      }
    },
    error: (error) => {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  });
}

 
  createClient() {
    this.dataService.createClient(this.newClient).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          alert('Client Created Successfully!');
          console.log(response);
 
          this.newClientId = response.data.clientId;
          this.userAccess.companyName = this.newClient.companyName;
 
          if (this.selectedClientType === 'new') {
            this.userAccess.clientId = this.newClientId;
          }
 
          localStorage.setItem('newClientId', this.newClientId.toString());
 
          this.isUserAccessEnabled = true;
          this.cdr.detectChanges();
        } else {
          alert(response.phrase || 'Error creating client');
        }
      },
      error: (error) => {
        console.error('Error creating client:', error);
        alert('Error creating client. Please try again.');
      }
    });
  }
 
  getClients() {
    this.dataService.getExistingClients().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.existingClients = response.data;
        }
      },
      error: (error) => {
        console.error('Error getting clients:', error);
      }
    });
  }
 
  loadClientAndProjects() {
    if (this.selectedClientType !== 'existing') {
      return;
    }
 
    console.log('Fetching details for Existing Client...');
 
    this.dataService.getClientDetails().subscribe({
      next: (client) => {
        if (client && client.id) {
          this.userAccess.clientId = client.id;
          this.userAccess.companyName = client.companyName;
          localStorage.setItem('clientId', client.id.toString());
 
          console.log('Client Loaded:', client);
 
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading client details:', error);
      }
    });
 
    this.dataService.getProjectDetails().subscribe({
      next: (projects) => {
        this.existingProjects = projects;
        if (projects.length > 0) {
          this.userAccess.projectId = projects[0].projectId;
          this.userAccess.projectName = projects[0].projectName;
        }
        console.log('Projects Loaded:', projects);
      },
      error: (error) => {
        console.error('Error loading project details:', error);
      }
    });
  }
 
  onClientSelectionChange(clientId: number) {
    console.log('Client Selected:', this.selectedClientType, clientId);
 
    if (this.selectedClientType === 'existing') {
      this.userAccess.clientId = clientId;
 
      const selectedClient = this.existingClients.find(client => client.id === clientId);
      if (selectedClient) {
        this.userAccess.companyName = selectedClient.companyName;
        localStorage.setItem('existingclientId', clientId.toString());
      }
 
      this.loadClientAndProjects();
    }
 
    if (this.isUserCreated && this.selectedClientType !== null) {
      this.activeTab = 'userAccess';
      this.loadMachineLevelData();
    }
 
    this.cdr.detectChanges();
  }
 
  checkUserAccessEnabled() {
    this.isUserAccessEnabled = this.userAccess.userId !== 0 && this.userAccess.clientId !== 0;
  }
  
  assignUserAccess() {
    const merchantId = this.commonDataService.getMerchantId();

    const requestData = {
      clientId: this.userAccess.clientId,
      userId: this.userAccess.userId,
      companyName: this.userAccess.companyName,
      projectId: this.userAccess.projectId,
      projectName: this.userAccess.projectName,
      district: this.userAccess.district,
      machineId: this.userAccess.machineId,
      merchantId: merchantId, // Ensure merchant ID is set correctly
      roleId: this.userAccess.roleId,
      state: this.userAccess.state
    };
 
    if (!this.isUserAccessEnabled) {
      alert('User Access cannot be assigned until User ID and Client ID are set.');
      return;
    }
 
    this.dataService.assignUserAccess(requestData).subscribe({
      next: (response) => {
        if (response.code === 200) {
          //alert('User Access Assigned Successfully!');
          this.successMessage = 'User Access Assigned Sucessfully!'
          this.showSuccessMessage = true;
          console.log(requestData);
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.router.navigate(['/widgets']);  // Adjust the route as needed
        }, 2000);

        } else {
          alert(response.phrase || 'Error assigning user access');
        }
      },
      error: (error) => {
        console.error('Error assigning user access:', error);
        alert('Error assigning user access. Please try again.');
      }
    });
  }
}